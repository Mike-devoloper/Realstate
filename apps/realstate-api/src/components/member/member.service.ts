import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberUpdate } from '../../libs/dto/member.update';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/types/message';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MemberService {
    constructor(@InjectModel("Member") private readonly memberSchema: Model<Member>,
    private authService: AuthService) {}

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

    async getMember():Promise<string> {
        return "This is  getMember graphQl executed"
    }

    async getAllMemberByAdmin():Promise<string> {
        return "This is  getAllMemberByAdmin graphQl executed"
    }

    async updateMemberByAdmin():Promise<string> {
        return "This is  updateMemberByAdmin graphQl executed"
    }
}

