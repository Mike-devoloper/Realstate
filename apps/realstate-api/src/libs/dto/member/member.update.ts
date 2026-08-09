import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../../enums/member.enum";

@InputType()
export class MemberUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id: ObjectId;

    @IsOptional()
    @Field(() => MemberType, {nullable: true})
    memberType?: MemberType;

    @IsOptional()
    @Field(() => MemberStatus, {nullable: true})
    memberStatus?: MemberStatus;

    @Length(3, 12)
    @IsOptional()
    @Field(() => String, {nullable: true})
    memberNick?: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    memberPhone?: string;

    @Length(5, 15)
    @IsOptional()
    @Field(() => String, {nullable: true})
    memberPassword?: string;

    @Length(3, 100)
    @IsOptional()
    @Field(() => String, {nullable: true})
    memberFullName?: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    memberImage?: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    memberDesc?: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    memberAddress?: string;

    deletedAt?: Date;
}