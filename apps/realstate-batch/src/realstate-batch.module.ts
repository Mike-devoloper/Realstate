import { Module } from '@nestjs/common';
import { RealstateBatchController } from './realstate-batch.controller';
import { RealstateBatchService } from './realstate-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RealstateBatchController],
  providers: [RealstateBatchService],
})
export class RealstateBatchModule {}
