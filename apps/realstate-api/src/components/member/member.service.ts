import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';

@Injectable()
export class MemberService {
    constructor(@InjectModel("Member") private readonly memberSchema: Model<Member>) {}

    async signUp(input: MemberInput):Promise<Member> {
        try {
            const result = await this.memberSchema.create(input)
            return result;
        } catch(err) {
            console.log("Error in signUp service", err);
            throw new BadRequestException(err)
        }
    }

    async login(input: LoginInput):Promise<Member> {
        try {
            const {memberNick, memberPassword} = input
            const result = await this.memberSchema.findOne()
            return result
        } catch(err) {
            console.log("Error in login service", err);
            throw new BadRequestException(err)
        }
    }

    async updateMember():Promise<string> {
        return "This is  updateMember graphQl executed"
    }

    async getMember():Promise<string> {
        return "This is  getMember graphQl executed"
    }
}
