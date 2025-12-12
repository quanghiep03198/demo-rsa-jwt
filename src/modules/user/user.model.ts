import mongoose from 'mongoose'
import { IUser, UserRole } from './user.interface'

const UserSchema = new mongoose.Schema<IUser>(
	{
		displayName: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 50
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true,
			maxLength: 100
		},
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.USER
		}
	},
	{
		timestamps: true,
		collection: 'users'
	}
)

export const UserModel = mongoose.model('User', UserSchema)
