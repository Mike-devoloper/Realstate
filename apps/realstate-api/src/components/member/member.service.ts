import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
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
