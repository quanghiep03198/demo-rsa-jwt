import 'dotenv/config'

import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { IUser } from './user.interface'
import { UserModel } from './user.model'
import { CreateUserDTO } from './dto/create-user.dto'
import { UpdateUserDTO } from './dto/update-user.dto'
import { JwtService } from '../auth/jwt.service'
import { hashSync } from 'bcrypt'

export class UserService {
	private readonly jwtService: JwtService

	constructor() {
		/**
		 * @injection
		 */
		this.jwtService = new JwtService()
	}

	public async getAll() {
		return await UserModel.find({})
	}

	public async getById(id: mongoose.Types.ObjectId) {
		const user: IUser | null = await UserModel.findById(id)
		if (!user) throw createHttpError.NotFound("User doesn't exist")
		return user
	}

	public async create(data: CreateUserDTO) {
		const existedUser = await UserModel.findOne({ email: data.email })
		if (existedUser) throw createHttpError.Conflict('Email is already registered')
		const newUser = await new UserModel(data).save()
		const { publicKey } = JwtService.createKeyPairs(String(newUser._id))
		newUser.publicKey = publicKey
		newUser.password = hashSync(newUser.password, +process.env.SALT_ROUND!)
		await newUser.save()
		return newUser
	}

	public async update(id: mongoose.Types.ObjectId, data: UpdateUserDTO) {
		const user = await UserModel.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true
		})
		if (!user) throw createHttpError.NotFound('User not found')
	}

	public async delete(id: mongoose.Types.ObjectId) {
		const user = await UserModel.findByIdAndDelete(id)
		if (!user) throw createHttpError.NotFound('User not found')
		return user
	}
}
