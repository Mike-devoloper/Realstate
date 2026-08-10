import {ObjectId} from "bson"
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const availableAgentSorts = ["createdAt", "updatedAt", "memberLikes", "memberViews", "memberRankings"];
export const availableMemberSorts = ["createdAt", "updatedAt", "memberLikes", "memberViews"]

export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target) : target;
}

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};