import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { IUser } from './user.interface'
import { UserModel } from './user.model'
import { CreateUserDTO } from './dto/create-user.dto'
import { UpdateUserDTO } from './dto/update-user.dto'

export class UserService {
	static async getAll() {
		return await UserModel.find({})
	}

	static async getById(id: mongoose.Types.ObjectId) {
		const user: IUser | null = await UserModel.findById(id)
		if (!user) throw createHttpError.NotFound("User doesn't exist")
		return user
	}

	static async create(data: CreateUserDTO) {
		const existedUser = await UserModel.findOne({ email: data.email })
		if (existedUser) throw createHttpError.Conflict('Email is already registered')

		const newUser = await new UserModel(data).save()
		return newUser
	}

	static async update(id: mongoose.Types.ObjectId, data: UpdateUserDTO) {
		const user = await UserModel.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true
		})
		if (!user) throw createHttpError.NotFound('User not found')
	}

	static async delete(id: mongoose.Types.ObjectId) {
		const user = await UserModel.findByIdAndDelete(id)
		if (!user) throw createHttpError.NotFound('User not found')
		return user
	}
}
