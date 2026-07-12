import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MemberService {
    constructor(@InjectModel("Member") private readonly memberSchema: Model<null>) {}

    async signUp():Promise<string> {
        return "This is Query signUP graphQl executed"
    }

    async login():Promise<string> {
        return "This is  LOGin graphQl executed"
    }

    async updateMember():Promise<string> {
        return "This is  updateMember graphQl executed"
    }

    async getMember():Promise<string> {
        return "This is  getMember graphQl executed"
    }
}
