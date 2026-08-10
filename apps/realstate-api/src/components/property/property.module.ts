import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../schemas/Property.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Property', schema: PropertySchema }]),
  AuthModule,
  ViewModule],
  providers: [PropertyService, PropertyResolver]
})
export class PropertyModule {}
