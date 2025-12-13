import { model, Schema } from 'mongoose'
import { IRevokedToken } from './jwt.interface'

export const RevokedJwtSchema = new Schema<IRevokedToken>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		token: { type: String, required: true }
	},
	{
		timestamps: true,
		collection: 'revoked_jwts'
	}
)

export const RevokedJwtModel = model('RevokedJwt', RevokedJwtSchema)
