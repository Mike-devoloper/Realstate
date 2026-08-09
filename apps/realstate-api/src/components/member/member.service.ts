import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/types/message';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class MemberService {
    constructor(@InjectModel("Member") private readonly memberSchema: Model<Member>,
    private authService: AuthService,
    private viewService: ViewService) {}

    async signUp(input: MemberInput):Promise<Member> {
        // HASH PASSWORD
        input.memberPassword = await this.authService.hashPassword(input.memberPassword);
        try{
            const result = await this.memberSchema.create(input)
            //AUTH TOKEN 
            result.accessToken = await this.authService.createToken(result);
            return result;
        } catch(err) {
            console.log("error service signup", err.message);
            throw new BadRequestException(Message.ALREADY_USED_MEMBER_NICK)
        }
    }

    async login(input: LoginInput):Promise<Member> {
            const {memberNick, memberPassword} = input;
            const response: Member = await this.memberSchema
            .findOne({memberNick: memberNick})
            .select("+memberPassword")
            .exec();
             if(!response || response.memberStatus === MemberStatus.DELETED){
                throw new InternalServerErrorException(Message.NO_MEMBER_NICK)
             } else if (response.memberStatus === MemberStatus.BLOCK){
                throw new InternalServerErrorException(Message.BLOCKED_USER)
             }
             //Compare Hash Password
             const isMatch = await this.authService.comparePassword(memberPassword, response.memberPassword)
             if(!isMatch) throw new BadRequestException(Message.WRONG_PASSWORD)
             response.accessToken = await this.authService.createToken(response)
            return response;

    }

    async updateMember(memberId: ObjectId, input: MemberUpdate):Promise<Member> {
        const result: Member = await this.memberSchema.findOneAndUpdate({
            _id: memberId,
            memberStatus: MemberStatus.ACTIVE,
         },
         input,
         {new: true}
         ).exec()
         if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
         result.accessToken = await this.authService.createToken(result)
        return result;
    }

    async getMember(memberId: ObjectId, targetId: ObjectId):Promise<Member> {
        const search: T = {
            _id: targetId,
            memberStatus: {
                $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK]
            },
        };
        const targetMember = await this.memberSchema.findOne(search).lean().exec()
        if(!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND)

        if(memberId) {
            const viewInput: ViewInput = {memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER}
            const newView = await this.viewService.recordView(viewInput);
            if(newView) {
                await this.memberSchema.findOneAndUpdate(search, {$inc: {memberViews: 1}}, {new: true}).exec()
                targetMember.memberViews++
            }

        }
        return targetMember;
    }

    async getAgents(memberId: ObjectId, input: AgentsInquiry):Promise<Members> {
        const {text} = input.search;
        const match: T = {memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE};
        const sort: T = {[input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC};

        if(text) match.memberNick = {$regex: new RegExp(text, "i")};

        console.log(" match:", match);

        const result = await this.memberSchema.aggregate([
            {$match: match},
            {$sort: sort},
            {
                $facet: {
                    list: [{$skip: (input.page -1)* input.limit}, {$limit: input.limit}],
                    metaCounter: [{$count: "total"}],
                } } 
        ]).exec()
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
        return result[0]
    }

    async getAllMemberByAdmin():Promise<string> {
        return "This is  getAllMemberByAdmin graphQl executed"
    }

    async updateMemberByAdmin():Promise<string> {
        return "This is  updateMemberByAdmin graphQl executed"
    }
}

