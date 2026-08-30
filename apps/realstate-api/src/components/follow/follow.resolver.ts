import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Follower, Followers, Followings } from '../../libs/dto/follow/follow';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { shapeIntoMongoObjectId } from '../../libs/types/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { FollowService } from './follow.service';

@Resolver()
export class FollowResolver {
    constructor(private readonly followService: FollowService) {}

    @UseGuards(AuthGuard)
    @Mutation(() => Follower)
    public async subscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId):Promise<Follower> {
        console.log("Mutation: subscribe and memberID:", memberId);
        const followingId = shapeIntoMongoObjectId(input);
        return await this.followService.subscribe(memberId, followingId);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Follower)
    public async unsubscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId):Promise<Follower> {
        console.log("Mutation: unsubscribe");
        const followingId = shapeIntoMongoObjectId(input);
        return await this.followService.unsubscribe(memberId, followingId);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Followings)
    public async getMemberFollowings(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId):Promise<Followings> {
        console.log("Mutation: getMemberFollowings");
        const {followerId} = input.search;
        input.search.followerId = shapeIntoMongoObjectId(followerId);
        return await this.followService.getMemberFollowings(memberId, input);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Followers)
    public async getMemberFollowers(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId):Promise<Followers> {
        console.log("Mutation: getMemberFollowers");
        const {followingId} = input.search;
        input.search.followingId = shapeIntoMongoObjectId(followingId);
        return await this.followService.getMemberFollowers(memberId, input);
    }
}
