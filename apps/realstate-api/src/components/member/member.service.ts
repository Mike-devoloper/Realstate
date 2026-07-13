import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
        //TO DO HASH PASSWORD
        input.memberPassword = await this.authService.hashPassword(input.memberPassword);
        try{
            const result = await this.memberSchema.create(input)
            //AUTH TOKEN 
            return result;
        } catch(err) {
            console.log("error service signup", err.message);
            throw new BadRequestException(Message.ALREADY_USED_MEMBER_NICK)
        }
    }

    async login(input: LoginInput):Promise<Member> {
            const {memberNick, memberPassword} = input
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
            return response;

    }

    async updateMember():Promise<string> {
        return "This is  updateMember graphQl executed"
    }

    async getMember():Promise<string> {
        return "This is  getMember graphQl executed"
    }
}
