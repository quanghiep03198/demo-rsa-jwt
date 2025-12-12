import { JwtService } from './../jwt.service'
import { NextFunction, Request, Response } from 'express'
import { UserModel } from '../../user/user.model'
import { IUser } from '../../user/user.interface'
import mongoose from 'mongoose'
import createHttpError from 'http-errors'
import { HttpStatusCode } from '../../../core/constants'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const accessToken = req.headers['authorization'] as string | undefined
		if (!accessToken) throw createHttpError.Unauthorized('Access token is missing')

		const userId = req.headers['x-user-id'] as string | undefined
		if (!userId) throw createHttpError.Unauthorized('User ID is missing')
		const userPublicKey = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })

		if (!userPublicKey) throw createHttpError.Unauthorized('User public key not found')

		const payload = JwtService.verify<Partial<IUser>>(
			accessToken.replace('Bearer', '').trim(),
			userPublicKey?.publicKey
		)
		req['user'] = payload

		next()
	} catch (error) {
		return res
			.status(HttpStatusCode.UNAUTHORIZED)
			.json({ message: 'Invalid access token', statusCode: HttpStatusCode.UNAUTHORIZED })
	}
}
