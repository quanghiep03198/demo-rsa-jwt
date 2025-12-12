import { Request, Response, Router } from 'express'
import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { Controller, Delete, Get, Patch, Post } from '../../core/decorators/controller.decorator'
import { UseExceptionFilter } from '../../core/decorators/exception-filter.decorator'

import { HttpStatusCode } from '../../core/constants'
import { IBaseController } from '../../core/interfaces'
import { UserService } from './user.service'
import { createUserDTO } from './dto/create-user.dto'
import { UseZodValidationPipe } from '../../core/decorators/zod-validation.decorator'
import { UseMiddleware } from '../../core/decorators/use-middleware.decorator'
import { authMiddleware } from '../auth/middlewares/jwt.middleware'
import { adminOnly } from '../auth/middlewares/role.middleware'

/**
 * Should be implemented {@link IBaseController}
 * @controller
 * @implements {IBaseController}
 *
 */

@Controller
export class UserController implements IBaseController {
	private readonly __router__: Router
	private readonly userService: UserService = new UserService()

	constructor() {
		this.__router__ = this.constructor.prototype.router

		/**
		 * @injection
		 */
		this.userService = new UserService()
	}

	public get router(): Router {
		return this.__router__
	}

	@Get('/users')
	async getAllUsers(_req: Request, res: Response) {
		const users = await this.userService.getAll()
		if (users.length === 0) throw createHttpError.NotFound('No user is available')
		res.status(HttpStatusCode.OK).json({
			message: HttpStatusCode.OK,
			data: users
		})
	}

	@Get('/users/:id')
	async getUserById(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')
		const id = new mongoose.Types.ObjectId(req.params.id)
		const user = await this.userService.getById(id)
		res.status(HttpStatusCode.OK).json({
			message: HttpStatusCode.OK,
			data: user
		})
	}

	@Post('/register')
	@UseZodValidationPipe(createUserDTO)
	@UseExceptionFilter()
	async register(req: Request, res: Response) {
		const user = await this.userService.create(req.body)
		return res.status(HttpStatusCode.CREATED).json({
			message: HttpStatusCode.CREATED,
			data: user
		})
	}

	@Patch('/users/:id')
	@UseMiddleware(authMiddleware)
	@UseExceptionFilter()
	async updateUser(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')

		const id = new mongoose.Types.ObjectId(req.params.id)
		const user = await this.userService.update(id, req.body)
		return res.status(HttpStatusCode.CREATED).json({
			message: HttpStatusCode.CREATED,
			data: user
		})
	}

	@Delete('/users/:id')
	@UseMiddleware(authMiddleware, adminOnly)
	@UseExceptionFilter()
	async deleteUser(req: Request, res: Response) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw createHttpError.BadRequest('Invalid id format')

		const id = new mongoose.Types.ObjectId(req.params.id)
		await this.userService.delete(id)
		return res.status(HttpStatusCode.NO_CONTENT).json({
			message: HttpStatusCode.NO_CONTENT
		})
	}
}
