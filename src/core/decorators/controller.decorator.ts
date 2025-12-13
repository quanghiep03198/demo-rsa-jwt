import 'reflect-metadata'
import express from 'express'
import { getMiddlewares } from './use-middleware.decorator'
import { AllExceptionFilter } from '../filters/exception.filter'

const ROUTES_KEY = 'routes'
const CONTROLLER_PREFIX_KEY = 'controller:prefix'

interface RouteDef {
	method: 'get' | 'post' | 'put' | 'patch' | 'delete'
	path: string
	handlerName: string
}

/**
 * Controller decorator với optional prefix
 * @param prefix - Optional route prefix (e.g., '/users', '/auth')
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @Get('/') // Actual route: /users/
 *   getAll() {}
 *
 *   @Get('/:id') // Actual route: /users/:id
 *   getById() {}
 * }
 * ```
 */
export function Controller(prefix?: string): <T extends { new (...args: any[]): {} }>(target: T) => any {
	return function <T extends { new (...args: any[]): {} }>(target: T) {
		// Lưu prefix vào metadata
		if (prefix) {
			Reflect.defineMetadata(CONTROLLER_PREFIX_KEY, prefix, target)
		}

		return class extends target {
			constructor(...args: any[]) {
				super(...args)

				// Sau khi instance được tạo (với dependencies đã inject), tạo router
				const router = express.Router()
				const routes = (Reflect.getMetadata(ROUTES_KEY, target) as RouteDef[]) || []
				const controllerPrefix = Reflect.getMetadata(CONTROLLER_PREFIX_KEY, target) as string | undefined

				for (const route of routes) {
					// Kết hợp prefix với path
					let fullPath = route.path
					if (controllerPrefix) {
						// Đảm bảo prefix bắt đầu bằng / và không kết thúc bằng /
						const normalizedPrefix = controllerPrefix.startsWith('/') ? controllerPrefix : `/${controllerPrefix}`
						const cleanPrefix = normalizedPrefix.endsWith('/') ? normalizedPrefix.slice(0, -1) : normalizedPrefix

						// Đảm bảo path bắt đầu bằng /
						const normalizedPath = route.path.startsWith('/') ? route.path : `/${route.path}`

						fullPath = cleanPrefix + normalizedPath
					}

					// Bind handler với instance hiện tại (this)
					const handler = (this as any)[route.handlerName].bind(this)

					// Lấy middlewares từ metadata
					const middlewares = getMiddlewares(target, route.handlerName)

					// Wrap handler với exception filter
					const wrappedHandler: express.RequestHandler = async (req, res, next) => {
						try {
							await handler(req, res, next)
						} catch (error) {
							new AllExceptionFilter().catch(error as Error, [req, res, next])
						}
					}

					switch (route.method) {
						case 'get':
							router.get(fullPath, ...middlewares, wrappedHandler)
							break
						case 'post':
							router.post(fullPath, ...middlewares, wrappedHandler)
							break
						case 'put':
							router.put(fullPath, ...middlewares, wrappedHandler)
							break
						case 'patch':
							router.patch(fullPath, ...middlewares, wrappedHandler)
							break
						case 'delete':
							router.delete(fullPath, ...middlewares, wrappedHandler)
							break
					}
				}

				// Lưu router vào instance
				Object.defineProperty(this, '__router__', {
					value: router,
					writable: false,
					enumerable: false,
					configurable: false
				})
			}

			get router(): express.Router {
				return (this as any).__router__
			}
		}
	}
}

export function Get(path: string = ''): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const routes: RouteDef[] = Reflect.getMetadata(ROUTES_KEY, target.constructor) || []

		routes.push({
			method: 'get',
			path,
			handlerName: propertyKey.toString()
		})

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor)
	}
}

/**
 * @publicApi
 * @param path
 * @returns
 */
export function Post(path: string = ''): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const routes: RouteDef[] = Reflect.getMetadata(ROUTES_KEY, target.constructor) || []

		routes.push({
			method: 'post',
			path,
			handlerName: propertyKey.toString()
		})

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor)
	}
}

export function Patch(path: string = ''): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const routes: RouteDef[] = Reflect.getMetadata(ROUTES_KEY, target.constructor) || []

		routes.push({
			method: 'patch',
			path,
			handlerName: propertyKey.toString()
		})

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor)
	}
}
export function Put(path: string = ''): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const routes: RouteDef[] = Reflect.getMetadata(ROUTES_KEY, target.constructor) || []

		routes.push({
			method: 'put',
			path,
			handlerName: propertyKey.toString()
		})

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor)
	}
}

export function Delete(path: string = ''): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const routes: RouteDef[] = Reflect.getMetadata(ROUTES_KEY, target.constructor) || []

		routes.push({
			method: 'delete',
			path,
			handlerName: propertyKey.toString()
		})

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor)
	}
}
