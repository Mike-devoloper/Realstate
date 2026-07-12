import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { MemberAuthType, MemberType } from "../../enums/member.enum";

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