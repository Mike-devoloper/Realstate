import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}

    @Mutation(() => String)
    @UsePipes(ValidationPipe)
    public async signUp(@Args('input') input: MemberInput): Promise<string>{
        console.log("Mutation signUp executed");
        console.log("Input:", input);
        return this.memberService.signUp()
    }
    @Mutation(() => String)
    @UsePipes(ValidationPipe)
    public async login(@Args('input') input: LoginInput):Promise<string>{
        console.log("Mutation login executed");
        console.log("Input:", input);
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
