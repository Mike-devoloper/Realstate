import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { PropertyModule } from './property/property.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [MemberModule, AuthModule, ViewModule, PropertyModule, BoardArticleModule, CommentModule]
})
export class ComponentsModule {}
