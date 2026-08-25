import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
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
}
