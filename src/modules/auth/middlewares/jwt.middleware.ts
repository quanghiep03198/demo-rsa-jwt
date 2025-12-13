import 'reflect-metadata'

import { JwtService } from './../jwt.service'
import { NextFunction, Request, Response } from 'express'
import { UserModel } from '../../user/user.model'
import { IUser } from '../../user/user.interface'
import mongoose, { Types } from 'mongoose'
import createHttpError, { HttpError } from 'http-errors'
import { HttpStatusCode } from '../../../core/constants'
import { IApplicationMiddleware } from '../../../core/interfaces'
import { Service } from 'typedi'
import { RevokedJwtModel } from '../revoke-jwt.model'
import { JsonWebTokenError } from 'jsonwebtoken'

@Service()
export class JwtMiddleware implements IApplicationMiddleware {
	constructor(private readonly jwtService: JwtService) {}

	async handle(req: Request, res: Response, next: NextFunction) {
		const extractTokenTokenFromHeader = (token: string | undefined) => {
			if (!token) throw createHttpError.Unauthorized('Access token is missing')
			return token.replace('Bearer', '').trim()
		}

		try {
			// * Extract token from Authorization header
			const accessToken = extractTokenTokenFromHeader(req.headers['authorization'])

			// * Extract userId from custom header
			const userId = req.headers['x-user-id'] as string | undefined
			if (!userId) throw createHttpError.Unauthorized('User ID is missing')

			// * Check if token is revoked
			const revokedToken = await RevokedJwtModel.findOne({
				userId: new Types.ObjectId(userId),
				token: accessToken
			}).lean(true)
			if (revokedToken) throw createHttpError.Unauthorized('Token has been revoked')

			// * Get user's public key to verify the token
			const userPublicKey = await UserModel.findOne({ _id: new Types.ObjectId(userId) })
			if (!userPublicKey) throw createHttpError.Unauthorized('User public key could not found')

			const payload = this.jwtService.verify<Partial<IUser>>(
				accessToken.replace('Bearer', '').trim(),
				userPublicKey?.publicKey
			)
			req['user'] = payload

			next()
		} catch (error) {
			const exception = error as Error | JsonWebTokenError | HttpError
			return res
				.status(HttpStatusCode.UNAUTHORIZED)
				.json({ message: exception.message, statusCode: HttpStatusCode.UNAUTHORIZED })
		}
	}
}
