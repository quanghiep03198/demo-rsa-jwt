import { Types } from 'mongoose'

export interface IBaseSchema {
	_id: Types.ObjectId
	__v: number
	createdAt: Date
	updatedAt: Date
}
