import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { Message } from '../../libs/types/message';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';


@Injectable()
export class BoardArticleService {
    constructor(@InjectModel("BoardArticle") private readonly boardArticleSchema: Model<BoardArticle>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService) {}

    public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput):Promise<BoardArticle> {
        input.memberId = memberId;
        try {
            const result = await this.boardArticleSchema.create(input)
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: "memberArticles",
                modifier: 1
            });
            return result;
        } catch(err) {
            console.log("Error, createBoardArticle service ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getBoardArticle(memberId: ObjectId, articleId: ObjectId):Promise<BoardArticle> {
        const search: T = {
            _id: articleId,
            articleStatus: BoardArticleStatus.ACTIVE,
        };

        const targetBoardArticle: BoardArticle = await this.boardArticleSchema.findOne(search).lean().exec();
        if(!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if(memberId) {
            const viewInput = {memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE};
            const newView = await this.viewService.recordView(viewInput);
            if(newView) {
                await this.boardArticleStatsEditor({_id: articleId, targetKey: "articleViews", modifier: 1})
                targetBoardArticle.articleViews++
            }
            //meLiked
        }
        targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
        return targetBoardArticle;
    }

    private async boardArticleStatsEditor(input: StatisticModifier):Promise<BoardArticle> {
        const {_id, targetKey, modifier} = input;
        console.log("article stats incremented");
        return await this.boardArticleSchema
        .findOneAndUpdate(
            _id,
            {
                $inc: { [targetKey]: modifier },
            },
            { new: true },
        )
        .exec();
    }
}
