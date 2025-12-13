import 'dotenv/config'
import 'reflect-metadata'
import createHttpError from 'http-errors'
import mongoose, { Types } from 'mongoose'
import { IUser } from './user.interface'
import { UserModel } from './user.model'
import { CreateUserDTO } from './dto/create-user.dto'
import { UpdateUserDTO } from './dto/update-user.dto'
import { JwtService } from '../auth/jwt.service'
import { hashSync } from 'bcrypt'
import { Inject, Service } from 'typedi'

@Service()
export class UserService {
	constructor(@Inject() public readonly jwtService: JwtService) {}

	public async getAll(currentUserId: string) {
		return await UserModel.find({ _id: { $ne: new Types.ObjectId(currentUserId) } }).select('-password -publicKey')
	}

	public async getById(id: Types.ObjectId) {
		const user: IUser | null = await UserModel.findById(id)
		if (!user) throw createHttpError.NotFound("User doesn't exist")
		return user
	}

	public async create(data: CreateUserDTO) {
		const existedUser = await UserModel.findOne({ email: data.email })
		if (existedUser) throw createHttpError.Conflict('Email is already registered')
		const newUser = await new UserModel(data).save()
		const { publicKey } = this.jwtService.createKeyPairs(String(newUser._id))
		newUser.publicKey = publicKey
		newUser.password = hashSync(newUser.password, +process.env.SALT_ROUND!)
		await newUser.save()
		return newUser
	}

	public async update(id: Types.ObjectId, data: UpdateUserDTO) {
		const user = await UserModel.findOne({ _id: id })
		if (!user) throw createHttpError.NotFound('User not found')
		const updatedUser = Object.assign(user, data)
		if (data.password) updatedUser.password = hashSync(data.password, +process.env.SALT_ROUND!)
		await updatedUser.save()
		if (!user) throw createHttpError.NotFound('User not found')
	}

	public async delete(id: mongoose.Types.ObjectId) {
		const user = await UserModel.findByIdAndDelete(id)
		if (!user) throw createHttpError.NotFound('User not found')
		return user
	}
}
