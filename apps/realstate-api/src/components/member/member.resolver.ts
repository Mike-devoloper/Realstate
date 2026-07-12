import { Resolver, Query, Mutation} from '@nestjs/graphql';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}

    @Mutation(() => String)
    public async signUp(): Promise<string>{
        console.log("Mutation signUp executed");
        return this.memberService.signUp()
    }
    @Mutation(() => String)
    public async login(): Promise<string>{
        console.log("Mutation login executed");
        return this.memberService.login()
    }

    @Mutation(() => String)
    public async updateMember(): Promise<string>{
        console.log("Mutation updateMember executed");
        return this.memberService.updateMember()
    }

    @Query(() => String)
    public async getMember():Promise<string>{
        console.log("GetMember exucuted");
        return this.memberService.getMember()
    }
}
