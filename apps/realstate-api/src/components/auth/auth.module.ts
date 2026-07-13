import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports:[
    HttpModule,
    JwtModule.register({
    secret: `${process.env.SECRET_KEY}`,
    signOptions: {
      expiresIn: "3d"
    }
  })],
  exports:[AuthService],
  providers:[AuthService]
})
export class AuthModule {}
