import { Request, Response, Router } from 'express'
import { Controller, Get, Post } from '../../core/decorators/controller.decorator'
import { UseExceptionFilter } from '../../core/decorators/exception-filter.decorator'
import { UseZodValidationPipe } from '../../core/decorators/zod-validation.decorator'
import { LoginDTO, loginDTO } from './dto/login.dto'
import { AuthService } from './auth.service'
import { HttpStatusCode } from '../../core/constants'
import { IUser } from '../user/user.interface'
import { IBaseController } from '../../core/interfaces'
import { UseMiddleware } from '../../core/decorators/use-middleware.decorator'
import { authMiddleware } from './middlewares/jwt.middleware'

@Controller
export class AuthController implements IBaseController {
	private readonly __router__: Router
	private readonly authService: AuthService

	constructor() {
		this.__router__ = this.constructor.prototype.router

		/**
		 * @injection
		 */
		this.authService = new AuthService()
	}

	public get router(): Router {
		return this.__router__
	}

	@Post('/login')
	@UseZodValidationPipe(loginDTO)
	@UseExceptionFilter()
	async login(req: Request<any, { user: Partial<IUser> }, LoginDTO>, res: Response) {
		const result = await this.authService.login(req.body)
		return res.status(HttpStatusCode.OK).json(result)
	}

	@Get('/profile')
	@UseExceptionFilter()
	@UseMiddleware(authMiddleware)
	async getProfile(req: Request<any, { user: Partial<IUser> }, LoginDTO>, res: Response) {
		const result = await this.authService.getProfile(req['user']?.id)
		return res.status(HttpStatusCode.OK).json(result)
	}
}
