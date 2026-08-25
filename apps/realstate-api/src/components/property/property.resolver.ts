import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query} from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentPropertiesInquiry, AllPropertiesInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { MemberType } from '../../libs/enums/member.enum';
import { shapeIntoMongoObjectId } from '../../libs/types/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { PropertyService } from './property.service';

@Resolver()
export class PropertyResolver {
    constructor(private readonly propertyService: PropertyService) {}

    @Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async createProperty(
        @Args("input") input: PropertyInput, 
        @AuthMember("_id") memberId: ObjectId
        ):Promise<Property> {
            console.log("Mutation: createProperty");
            input.memberId = memberId;
        return await this.propertyService.createProperty(input);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Property)
    public async getProperty(
        @Args('propertyId') input: string, 
        @AuthMember('_id') memberId: ObjectId):Promise<Property> {
        console.log("Query getProperty executed");
        const propertyId = shapeIntoMongoObjectId(input);
        return await this.propertyService.getProperty(memberId, propertyId);
    }

    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async updateProperty(
        @Args("input") input: PropertyUpdate,
        @AuthMember('_id') memberId: ObjectId): Promise<Property> {
        console.log("Mutation updateProperty executed");
        input._id = shapeIntoMongoObjectId(input._id);
        return await this.propertyService.updateProperty(memberId, input);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Properties)
    public async getProperties(
        @Args("input") input: PropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId
    ): Promise<Properties> {
        console.log("Query getProperties executed");
        return await this.propertyService.getProperties(memberId, input);
    }

    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Query(() => Properties)
    public async getAgentProperties(
        @Args("input") input: AgentPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId
    ): Promise<Properties> {
        console.log("Query AgentgetProperties executed");
        return await this.propertyService.getAgentProperties(memberId, input);
    }

    @UseGuards(AuthGuard)
	@Mutation(() => Property)
	public async likeTargetProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId):Promise<Property>{
		console.log("Mutation LikeTargetProperty");
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.propertyService.likeTargetProperty(memberId, likeRefId);
	}

    //=====ADMIN=====//

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Properties)
    public async getAllPropertiesByAdmin(
        @Args('input') input: AllPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId ):Promise<Properties> {
        console.log("Query: getAllPropertiesByAdmin");
        return await this.propertyService.getAllPropertiesByAdmin(input);
    }

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async updatePropertyByAdmin(
        @Args("input") input: PropertyUpdate,
        @AuthMember('_id') memberId: ObjectId): Promise<Property> {
        console.log("Mutation updatePropertyByAdmin executed");
        input._id = shapeIntoMongoObjectId(input._id);
        return await this.propertyService.updatePropertyByAdmin(input);
    }

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async removePropertyByAdmin(@Args("propertyId") input: string):Promise<Property> {
        console.log("Mutation removePropertyByAdmin executed");
        const propertyId = shapeIntoMongoObjectId(input);
        return await this.propertyService.removePropertyByAdmin(propertyId);
    }
}
