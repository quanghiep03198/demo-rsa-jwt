import { Request, Response } from 'express'
import { Controller, Get, Post } from '../../core/decorators/controller.decorator'
import { UseExceptionFilter } from '../../core/decorators/exception-filter.decorator'
import { UseZodValidationPipe } from '../../core/decorators/zod-validation.decorator'
import { LoginDTO, loginDTO } from './dto/login.dto'
import { AuthService } from './auth.service'
import { HttpStatusCode } from '../../core/constants'
import { IUser } from '../user/user.interface'
import { UseMiddleware } from '../../core/decorators/use-middleware.decorator'
import { JwtMiddleware } from './middlewares/jwt.middleware'
import { Inject } from 'typedi'
import { BaseAbstractController } from '../_base/base.abstract.controller'

@Controller('auth')
export class AuthController extends BaseAbstractController {
	constructor(@Inject() public readonly authService: AuthService) {
		super()
	}

	@Post('login')
	@UseZodValidationPipe(loginDTO)
	@UseExceptionFilter()
	async login(req: Request<any, { user: Partial<IUser> }, LoginDTO>, res: Response) {
		const result = await this.authService.login(req.body)
		return res.status(HttpStatusCode.OK).json({
			statusCode: HttpStatusCode.OK,
			message: 'Login successful',
			data: result
		})
	}

	@Post('logout')
	@UseMiddleware(JwtMiddleware)
	@UseExceptionFilter()
	async logout(req: Request<any, { user: Partial<IUser> }, void>, res: Response) {
		const token = req.headers['authorization'] as string
		const userId = req.user.id
		const result = await this.authService.logout(userId, token)
		return res
			.status(HttpStatusCode.OK)
			.json({ statusCode: HttpStatusCode.OK, message: 'Successfully logged out', data: result })
	}

	@Get('profile')
	@UseExceptionFilter()
	@UseMiddleware(JwtMiddleware)
	async getProfile(req: Request<any, { user: Partial<IUser> }, LoginDTO>, res: Response) {
		const result = await this.authService.getProfile(req['user']?.id)
		return res.status(HttpStatusCode.OK).json(result)
	}
}
