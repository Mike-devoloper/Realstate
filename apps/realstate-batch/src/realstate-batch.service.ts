import { Injectable } from '@nestjs/common';

@Injectable()
export class RealstateBatchService {
  getHello(): string {
    return 'Welcome to Batch Server !';
  }
}
