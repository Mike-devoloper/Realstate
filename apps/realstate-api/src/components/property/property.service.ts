import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/types/message';
import { AuthService } from '../auth/auth.service';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';

@Injectable()
export class PropertyService {
    constructor(@InjectModel("Property") private readonly propertySchema: Model<Property>,
    private memberService: MemberService,
    private authService: AuthService,
    private viewService: ViewService) {}

    public async createProperty(input: PropertyInput):Promise<Property> {
        try {
            const result = await this.propertySchema.create(input);
            await this.memberService.memberStatsEditor({_id: result.memberId, targetKey: 'memberProperties', modifier: 1,})
            return result;
        } catch(err) {
            console.log("Error, Property Service Model: ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }   
    }

}
