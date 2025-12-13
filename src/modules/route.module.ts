import 'reflect-metadata'
import express, { Application } from 'express'
import { UserController } from './user/user.controller'
import { AuthController } from './auth/auth.controller'
import Container from 'typedi'
import { UserService } from './user/user.service'
import { AuthService } from './auth/auth.service'

type RouteModuleOptions = {
	prefix: string
	app: Application
}

export class RouteModule {
	static async forRootAsync({ prefix, app }: RouteModuleOptions) {
		try {
			const router = express.Router()
			const { router: userRouter } = new UserController(Container.get(UserService))
			const { router: authRouter } = new AuthController(Container.get(AuthService))
			router.use(userRouter)
			router.use(authRouter)
			app.use(prefix, router)
			console.info('[RouteModule] Routes registered successfully')
		} catch (error) {
			console.error('[RouteModule]', error instanceof Error ? error.message : error)
		}
	}
}
