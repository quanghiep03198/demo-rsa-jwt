import { Types } from 'mongoose'
import { IBaseSchema } from '../_base/base.schema.interface'

export interface IRevokedToken extends IBaseSchema {
	userId: Types.ObjectId
	token: string
}
