import mongoose from 'mongoose'
import { IUser, UserRole } from './user.interface'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import 'dotenv/config'

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
		publicKey: {
			type: String,
			required: false
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

UserSchema.methods.verifyPassword = function (password: string) {
	if (!password) return false
	return compareSync(password, this.password)
}

export const UserModel = mongoose.model('User', UserSchema)
