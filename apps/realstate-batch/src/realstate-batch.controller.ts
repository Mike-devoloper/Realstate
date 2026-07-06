import { Controller, Get } from '@nestjs/common';
import { RealstateBatchService } from './realstate-batch.service';

@Controller()
export class RealstateBatchController {
  constructor(private readonly realstateBatchService: RealstateBatchService) {}

  @Get()
  getHello(): string {
    return this.realstateBatchService.getHello();
  }
}
