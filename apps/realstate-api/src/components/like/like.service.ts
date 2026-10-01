import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { Properties } from '../../libs/dto/property/property';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { T } from '../../libs/types/common';
import { lookupFavorite } from '../../libs/types/config';
import { Message } from '../../libs/types/message';

@Injectable()
export class LikeService {
    constructor(@InjectModel('Like') private readonly likeSchema: Model<Like>){}

    public async toggleLike(input: LikeInput):Promise<number> {
        const search: T = {memberId: input.memberId, likeRefId: input.likeRefId},
            exist = await this.likeSchema.findOne(search).exec();
        let modifier = 1;
        if(exist) {
            await this.likeSchema.findOneAndDelete(search).exec();
            modifier = -1;
        } else {
            try {
                await this.likeSchema.create(input);
            } catch(err) {
                console.log("Error: Service.model: ", err.message);
                throw new BadRequestException(Message.CREATE_FAILED);
            }
        }
        return modifier;
    };

    public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
        const {memberId, likeRefId} = input;
        const result = await this.likeSchema.findOne({memberId: memberId, likeRefId: likeRefId});
        return result ? [{memberId: memberId, likeRefId: likeRefId, myFavorite: true}] : [];
    }

    public async getFavoriteProperties(memberId: ObjectId, inquiry: OrdinaryInquiry):Promise<Properties> {
        const {page, limit} = inquiry;

        const match:T = {likeGroup: LikeGroup.PROPERTY, memberId: memberId};
        const data: T = await this.likeSchema.aggregate([
            {$match: match},
            {$sort: {updatedAt: -1}},
            {
                $lookup: {
                    from: "properties",
                    localField: "likeRefId",
                    foreignField: "_id",
                    as: "favoriteProperty",
                }
            },
            {$unwind: "$favoriteProperty"},
            {
                $facet: {
                    list: [
                        {$skip: (page-1)* limit},
                        {$limit: limit},
                        lookupFavorite
                    ],
                    metaCounter: [{$count: 'total'}],
                }
            }
        ]).exec();
        console.log("Favorite => :", data);
        const  result: Properties = {list: [], metaCounter: data[0].metaCounter};
        console.log("result => :", result);
        result.list = data[0].list.map((ele) => ele.favoriteProperty);
        return result;
    }
}
