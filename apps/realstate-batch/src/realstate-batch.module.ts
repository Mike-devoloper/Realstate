import { Module } from '@nestjs/common';
import { RealstateBatchController } from './realstate-batch.controller';
import { RealstateBatchService } from './realstate-batch.service';

@Module({
  imports: [],
  controllers: [RealstateBatchController],
  providers: [RealstateBatchService],
})
export class RealstateBatchModule {}
