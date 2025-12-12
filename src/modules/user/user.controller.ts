import { Request, Response, Router } from 'express'
import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { Controller, Delete, Get, Patch, Post } from '../../core/decorators/controller.decorator'
import { UseExceptionFilter } from '../../core/decorators/exception-filter.decorator'

import { HttpStatusCode } from '../../core/constants'
import { BaseControllerInterface } from '../../core/interfaces'
import { UserService } from './user.service'
import { createUserDTO } from './dto/create-user.dto'
import { UseZodValidationPipe } from '../../core/decorators/zod-validation.decorator'

/**
 * Should be implemented {@link BaseControllerInterface}
 * @controller
 * @implements {BaseControllerInterface}
 *
 */

@Controller
export class UserController implements BaseControllerInterface {
	private __router__: Router

	constructor() {
		this.__router__ = this.constructor.prototype.router
	}

	public get router(): Router {
		return this.__router__
	}

	@Get('/users')
	@UseExceptionFilter()
	async getAllUsers(_req: Request, res: Response) {
		const users = await UserService.getAll()
		if (users.length === 0) throw createHttpError.NotFound('No user is available')
		res.status(HttpStatusCode.OK).json({
			message: HttpStatusCode.OK,
			data: users
		})
	}

	@Get('/users/:id')
	@UseExceptionFilter()
	async getUserById(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')
		const id = new mongoose.Types.ObjectId(req.params.id)
		const user = await UserService.getById(id)
		res.status(HttpStatusCode.OK).json({
			message: HttpStatusCode.OK,
			data: user
		})
	}

	@Post('/register')
	@UseZodValidationPipe(createUserDTO)
	@UseExceptionFilter()
	async register(req: Request, res: Response) {
		const user = await UserService.create(req.body)
		res.status(HttpStatusCode.CREATED).json({
			message: HttpStatusCode.CREATED,
			data: user
		})
	}

	@Patch('/users/:id')
	@UseExceptionFilter()
	async updateUser(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')

		const id = new mongoose.Types.ObjectId(req.params.id)
		const user = await UserService.update(id, req.body)
		return res.status(HttpStatusCode.CREATED).json({
			message: HttpStatusCode.CREATED,
			data: user
		})
	}

	@Delete('/users/:id')
	@UseExceptionFilter()
	async deleteUser(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')

		const id = new mongoose.Types.ObjectId(req.params.id)
		await UserService.delete(id)
		return res.status(HttpStatusCode.NO_CONTENT).json({
			message: HttpStatusCode.NO_CONTENT
		})
	}
}
