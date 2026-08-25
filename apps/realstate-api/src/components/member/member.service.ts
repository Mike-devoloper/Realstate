import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/types/message';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { Like } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberSchema: Model<Member>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async signUp(input: MemberInput): Promise<Member> {
		// HASH PASSWORD
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberSchema.create(input);
			//AUTH TOKEN
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (err) {
			console.log('error service signup', err.message);
			throw new BadRequestException(Message.ALREADY_USED_MEMBER_NICK);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response: Member = await this.memberSchema
			.findOne({ memberNick: memberNick })
			.select('+memberPassword')
			.exec();
		if (!response || response.memberStatus === MemberStatus.DELETED) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}
		//Compare Hash Password
		const isMatch = await this.authService.comparePassword(memberPassword, response.memberPassword);
		if (!isMatch) throw new BadRequestException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response);
		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberSchema
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember = await this.memberSchema.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput: ViewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberSchema.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
			//meLiked
			const likeInput = {memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER}
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);

		}
		return targetMember;
	}

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };

		const result = await this.memberSchema
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId):Promise<Member>{
		const target: Member = await this.memberSchema.findOne({_id: likeRefId, memberStatus: MemberStatus.ACTIVE}).exec();
		if(!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER
		};

		//Like toggle 
		const modifier:number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({_id: likeRefId, targetKey: "memberLikes", modifier: modifier});
		if(!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)

		return result;
	}

	public async getAllMemberByAdmin(input: MembersInquiry): Promise<Members> {
		const { text, memberStatus, memberType } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('memberType:', memberType);
		console.log('match:', match);

		const result = await this.memberSchema
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberSchema.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		const { _id, targetKey, modifier } = input;
        console.log("executed ++")
		return await this.memberSchema
			.findByIdAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{ new: true },
			)
			.exec();
	}
}
