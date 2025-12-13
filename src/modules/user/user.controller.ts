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
import { adminOnly, RoleBaseMiddleware } from '../auth/middlewares/role.middleware'
import { Inject } from 'typedi'
import { JwtMiddleware } from '../auth/middlewares/jwt.middleware'
import { UserRole } from './user.interface'
import { isValidObjectId } from 'mongoose'
import { Types } from 'mongoose'
import { UpdateUserDTO, updateUserDTO } from './dto/update-user.dto'
import { BaseAbstractController } from '../_base/base.abstract.controller'

/**
 * Should be implemented {@link IBaseController}
 * @controller
 * @implements {IBaseController}
 *
 */

@Controller('user')
export class UserController extends BaseAbstractController {
	constructor(private readonly userService: UserService) {
		super()
	}

	@Post('register')
	@UseZodValidationPipe(createUserDTO)
	@UseExceptionFilter()
	async register(req: Request, res: Response) {
		const user = await this.userService.create(req.body)
		return res.status(HttpStatusCode.CREATED).json({
			message: HttpStatusCode.CREATED,
			data: user
		})
	}

	@Get()
	@UseMiddleware(JwtMiddleware, RoleBaseMiddleware.requireRoles(UserRole.ADMIN))
	@UseExceptionFilter()
	async getAllUsers(req: Request, res: Response) {
		const users = await this.userService.getAll(req.user.id)
		if (users.length === 0) throw createHttpError.NotFound('No user is available')
		return res.status(HttpStatusCode.OK).json({
			message: HttpStatusCode.OK,
			data: users
		})
	}

	@Patch('profile')
	@UseZodValidationPipe(updateUserDTO)
	@UseMiddleware(JwtMiddleware)
	@UseExceptionFilter()
	async updateProfile(req: Request<void, any, UpdateUserDTO, {}>, res: Response) {
		if (!isValidObjectId(req.user?.id)) throw createHttpError.BadRequest('Invalid id format')
		const id = new Types.ObjectId(req.user.id)
		const user = await this.userService.update(id, req.body)
		return res.status(HttpStatusCode.CREATED).json({
			statusCode: HttpStatusCode.CREATED,
			message: 'User profile updated successfully',
			data: user
		})
	}

	@Delete('delete/:id')
	@UseMiddleware(JwtMiddleware, RoleBaseMiddleware.requireRoles(UserRole.ADMIN))
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
