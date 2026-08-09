import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';

@Module({
  imports: [MemberModule, AuthModule, ViewModule]
})
export class ComponentsModule {}
