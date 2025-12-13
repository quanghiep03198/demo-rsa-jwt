import 'reflect-metadata'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { IApplicationMiddleware } from '../interfaces'
import Container from 'typedi'

const MIDDLEWARE_KEY = 'middlewares'

type MiddlewareClass = new (...args: any[]) => IApplicationMiddleware
type MiddlewareType = MiddlewareClass | RequestHandler

/**
 * Decorator to apply middlewares to a route handler
 * @param middlewares - Array of middleware classes or Express middleware functions
 *
 * @example
 * ```typescript
 * @UseMiddleware(JwtMiddleware, RoleMiddleware)
 * @Get('/profile')
 * async getProfile(req: Request, res: Response) {
 *   // handler code
 * }
 * ```
 */
export function UseMiddleware(...middlewares: MiddlewareType[]): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		// Get existing middlewares from metadata
		const existingMiddlewares: MiddlewareType[] =
			Reflect.getMetadata(MIDDLEWARE_KEY, target.constructor, propertyKey) || []

		// Add new middlewares
		const allMiddlewares = [...existingMiddlewares, ...middlewares]

		// Save metadata
		Reflect.defineMetadata(MIDDLEWARE_KEY, allMiddlewares, target.constructor, propertyKey)

		return descriptor
	}
}

/**
 * Helper function to get middlewares from metadata and convert to RequestHandler
 * Automatically resolves dependencies using TypeDI Container
 */
export function getMiddlewares(target: any, propertyKey: string | symbol): RequestHandler[] {
	const middlewares: MiddlewareType[] = Reflect.getMetadata(MIDDLEWARE_KEY, target, propertyKey) || []

	return middlewares.map((middleware) => {
		// Check if it's a class (has prototype and handle method)
		if (typeof middleware === 'function' && middleware.prototype && 'handle' in middleware.prototype) {
			// Try to get instance from TypeDI Container (with dependencies resolved)
			// If not registered in container, create new instance without dependencies
			let instance: IApplicationMiddleware

			try {
				// Try to get from container (will resolve dependencies automatically)
				instance = Container.get(middleware as MiddlewareClass)
			} catch {
				// Fallback: create instance without DI if not registered
				instance = new (middleware as MiddlewareClass)()
			}

			return (req: Request, res: Response, next: NextFunction) => {
				return instance.handle(req, res, next)
			}
		}

		// Otherwise, it's already a RequestHandler function
		return middleware as RequestHandler
	})
}
