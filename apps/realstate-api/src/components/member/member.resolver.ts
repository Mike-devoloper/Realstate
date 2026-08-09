import { InternalServerErrorException, UseGuards} from '@nestjs/common';
import { Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MemberUpdate } from '../../libs/dto/member.update';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}

    @Mutation(() => Member)
    public async signUp(@Args('input') input: MemberInput): Promise<Member>{
            console.log("Mutation signUp executed");
            console.log("Input:", input);
            return this.memberService.signUp(input)
    }
    @Mutation(() => Member)
    public async login(@Args('input') input: LoginInput):Promise<Member>{
             console.log("Mutation login executed");
             console.log("Input:", input);
             return this.memberService.login(input)
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args("input") input: MemberUpdate, 
        @AuthMember('_id') memberId: ObjectId): Promise<Member>{
        console.log("Mutation updateMember executed");
        delete input._id
        return this.memberService.updateMember(memberId, input)
    }

    @Query(() => String)
    public async getMember():Promise<string>{
        console.log("GetMember exucuted");
        return this.memberService.getMember()
    }

    /*  ADMIN  */
    @Mutation(() => String)
    public async getAllMemberByAdmin(): Promise<string>{
        console.log("Mutation getAllMemberByAdmin executed");
        return this.memberService.getAllMemberByAdmin()
    }


    @Mutation(() => String)
    public async updateMemberByAdmin(): Promise<string>{
        console.log("Mutation updateMemberByAdmin executed");
        return this.memberService.updateMemberByAdmin()
    }


    //TEST CHECK AUTH API
    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string>{
        return `Hi ${memberNick}`
    }

    @Roles(MemberType.USER, MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string>{
        return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`
    }
}
