import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LikeSchema from '../../schemas/Like.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';

import { LikeService } from './like.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Like', schema: LikeSchema}]),
  AuthModule],
  providers: [LikeService],
  exports: [LikeService]
})
export class LikeModule {}
