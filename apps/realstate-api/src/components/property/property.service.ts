import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/types/config';
import { Direction, Message } from '../../libs/types/message';
import { AuthService } from '../auth/auth.service';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';

@Injectable()
export class PropertyService {
    constructor(@InjectModel("Property") private readonly propertySchema: Model<Property>,
    private memberService: MemberService,
    private authService: AuthService,
    private viewService: ViewService) {}

    public async createProperty(input: PropertyInput):Promise<Property> {
        try {
            const result = await this.propertySchema.create(input);
            await this.memberService.memberStatsEditor({_id: result.memberId, targetKey: 'memberProperties', modifier: 1,})
            return result;
        } catch(err) {
            console.log("Error, Property Service Model: ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }   
    }

    public async getProperty(memberId: ObjectId, propertyId: ObjectId):Promise<Property> {
        const search: T = {
            _id: propertyId,
            propertyStatus: PropertyStatus.ACTIVE,
        };
        const targetProperty: Property = await this.propertySchema.findOne(search).lean().exec();
        if(!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        if(memberId) {
            const viewInput = {memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY};
            const newView = await this.viewService.recordView(viewInput);
            if(newView) {
                await this.propertyStatsEditor({_id: propertyId, targetKey: "propertyViews", modifier: 1});
                targetProperty.propertyViews++
            }
            //meLiked
        }

        targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
        return targetProperty;
    }


    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
		const { _id, targetKey, modifier } = input;
        console.log("executed ++")
		return await this.propertySchema
			.findOneAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{ new: true },
			)
			.exec();
	}

    public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
        let {propertyStatus, soldAt, deletedAt} = input;
        const search: T = {
            _id: input._id, 
            memberId: memberId,
            propertyStatus: PropertyStatus.ACTIVE
        };
        if(propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
        else if(propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

        const result = await this.propertySchema
        .findOneAndUpdate(search, input, {new: true}).exec();
        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        if(soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberProperties',
                modifier: -1,
            })
        }
        return result;
    }

    public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
        console.log("Query getProperties executed");
        const match: T = {propertyStatus: PropertyStatus.ACTIVE};
        const sort: T = {[input?.sort ?? 'createdAt'] : input?.direction ?? Direction.DESC};

        this.shapeMatchQuery(match, input);
        console.log("match: =>", match);

        const result = await this.propertySchema
        .aggregate([
            {$match: match},
            {$sort: sort},
            {
                $facet: {
                    list: [
                        {$skip: (input.page -1) * input.limit},
                        {$limit: input.limit},
                        //meLiked
                        lookupMember,
                        {$unwind: '$memberData'},
                    ],
                    metaCounter: [{$count: 'total'}],
                }
            }
        ]).exec();

        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        
        return result[0];
    }

    private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
        const {
            memberId,
            locationList,
            roomsList,
            bedsList,
            typeList,
            periodsRange,
            squaresRange,
            priceRange,
            text,
            options
        } = input.search;

        if(memberId) match.memberId = shapeIntoMongoObjectId(memberId);
        if(locationList) match.propertyLocation = {$in: locationList};
        if(roomsList) match.propertyRooms = {$in: roomsList};
        if(bedsList) match.propertyBeds = {$in: bedsList};
        if(typeList) match.propertyType = {$in: typeList};

        if(priceRange) match.propertyPrice = {$gte: priceRange.start, $lte: priceRange.end};
        if(periodsRange) match.createdAt = {$gte: periodsRange.start, $lte: periodsRange.end};
        if(squaresRange) match.propertySquare = {$gte: squaresRange.start, $lte: squaresRange.end};

        if(text) match.propertyTitle = {$regex: new RegExp(text, 'i')};
        if(options) {
            match['$or'] = options.map((ele) => {
                return {[ele]: true};
            })
        }
    }
}
