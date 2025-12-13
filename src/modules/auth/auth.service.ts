import 'reflect-metadata'

import createHttpError from 'http-errors'
import { UserModel } from '../user/user.model'
import { LoginDTO } from './dto/login.dto'
import { JwtService } from './jwt.service'
import { readFileSync } from 'node:fs'
import { Schema, Types } from 'mongoose'
import { Inject, Service } from 'typedi'
import { RevokedJwtModel } from './revoke-jwt.model'

@Service()
export class AuthService {
	constructor(@Inject() public readonly jwtService: JwtService) {}

	public async login(payload: LoginDTO) {
		const user = await UserModel.findOne({ email: payload.email }).select('-__v')
		if (!user) throw createHttpError.NotFound('User not found')
		if (!user.verifyPassword(payload.password)) throw new createHttpError.Unauthorized('Invalid password')
		const userPrivateKey = readFileSync(`./keys/${user._id}.pem`, 'utf-8')

		const jwtPayload = {
			id: String(user._id),
			email: user.email,
			role: user.role
		}
		const accessToken = this.jwtService.sign(jwtPayload, userPrivateKey, '5m')

		return {
			user: {
				_id: user._id,
				email: user.email,
				displayName: user.displayName,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
			accessToken
		}
	}

	public async logout(userId: string, accessToken: string) {
		return await new RevokedJwtModel({
			userId: new Types.ObjectId(userId),
			token: accessToken.replace('Bearer', '').trim()
		}).save()
	}

	public async getProfile(userId: string) {
		const user = await UserModel.findOne({ _id: new Types.ObjectId(userId) }).select('-password -__v -publicKey')
		if (!user) throw createHttpError.NotFound('User not found')
		return user
	}
}
