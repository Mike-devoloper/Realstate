import { InternalServerErrorException} from '@nestjs/common';
import { Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}

    @Mutation(() => Member)
    public async signUp(@Args('input') input: MemberInput): Promise<Member>{
        try{
            console.log("Mutation signUp executed");
            console.log("Input:", input);
            return this.memberService.signUp(input)
        } catch(err) {
            console.log("error occured signUp:", err);
            throw new InternalServerErrorException(err)
        }
    }
    @Mutation(() => Member)
    public async login(@Args('input') input: LoginInput):Promise<Member>{
        try{
             console.log("Mutation login executed");
             console.log("Input:", input);
             return this.memberService.login(input)
        } catch(err) {
            console.log("error occured login:", err);
            throw new InternalServerErrorException(err)
        }
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
