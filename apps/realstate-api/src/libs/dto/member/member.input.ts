import { Field, InputType, Int } from "@nestjs/graphql";
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { MemberAuthType, MemberStatus, MemberType } from "../../enums/member.enum";
import { availableAgentSorts, availableMemberSorts } from "../../types/config";
import { Direction } from "../../types/message";

@InputType()
export class MemberInput {
    @Length(3, 12)
    @IsNotEmpty()
    @Field(() => String)
    memberNick: string;

    @IsNotEmpty()
    @Field(() => String)
    memberPhone: string;

    @Length(5, 15)
    @IsNotEmpty()
    @Field(() => String)
    memberPassword: string;

    @IsOptional()
    @Field(() => MemberType, {nullable: true})
    memberType?: MemberType;

    @IsOptional()
    @Field(() => MemberAuthType, {nullable: true})
    memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
    @Length(3, 12)
    @IsNotEmpty()
    @Field(() => String)
    memberNick: string;

    @Length(5, 15)
    @IsNotEmpty()
    @Field(() => String)
    memberPassword: string;
}


@InputType()
class AISearch {
    @IsOptional()
    @Field(() => String, {nullable: true})
    text?: string
}


@InputType()
export class AgentsInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableAgentSorts)
    @Field(() => String, {nullable: true})
    sort?: string

    @IsOptional()
    @Field(() => Direction, {nullable: true})
    direction?: Direction

    @IsNotEmpty()
    @Field(() => AISearch)
    search: AISearch;

}

@InputType()
class MISearch {

    @IsOptional()
    @Field(() => MemberStatus, {nullable: true})
    memberStatus?: MemberStatus;

    @IsOptional()
    @Field(() => MemberType, {nullable: true})
    memberType?: MemberType;

    @IsOptional()
    @Field(() => String, {nullable: true})
    text?: string
}

@InputType()
export class MembersInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableMemberSorts)
    @Field(() => String, {nullable: true})
    sort?: string

    @IsOptional()
    @Field(() => Direction, {nullable: true})
    direction?: Direction

    @IsNotEmpty()
    @Field(() => MISearch)
    search: MISearch;

}