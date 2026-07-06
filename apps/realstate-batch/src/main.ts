import { NestFactory } from '@nestjs/core';
import { RealstateBatchModule } from './realstate-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(RealstateBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
