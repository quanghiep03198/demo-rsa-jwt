import createHttpError from 'http-errors'
import { UserModel } from '../user/user.model'
import { LoginDTO } from './dto/login.dto'
import { JwtService } from './jwt.service'
import { readFileSync } from 'node:fs'
import { Schema, Types } from 'mongoose'

export class AuthService {
	public async login(payload: LoginDTO) {
		const user = await UserModel.findOne({ email: payload.email }).select('_id email password role')
		if (!user) throw createHttpError.NotFound('User not found')
		if (!user.verifyPassword(payload.password)) throw new createHttpError.Unauthorized('Invalid password')
		const userPrivateKey = readFileSync(`./keys/${user._id}.pem`, 'utf-8')

		const accessToken = JwtService.sign(
			{
				id: String(user._id),
				email: user.email,
				role: user.role
			},
			userPrivateKey,
			'1h'
		)

		return {
			user: user.toObject(),
			accessToken
		}
	}

	public async getProfile(userId: string) {
		const user = await UserModel.findOne({ _id: new Types.ObjectId(userId) }).select('-password')
		if (!user) throw createHttpError.NotFound('User not found')
		return user
	}
}
