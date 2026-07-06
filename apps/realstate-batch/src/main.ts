import { NestFactory } from '@nestjs/core';
import { RealstateBatchModule } from './realstate-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(RealstateBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
