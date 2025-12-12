import express from 'express'
import 'reflect-metadata'
import { getMiddlewares } from './use-middleware.decorator'
import { AllExceptionFilter } from '../filters/exception.filter'

const ROUTES_KEY = 'routes'

interface RouteDef {
	method: 'get' | 'post' | 'put' | 'patch' | 'delete'
	path: string
	handlerName: string
}

export function Controller<T extends { new (...args: any[]): {} }>(target: T) {
	const router = express.Router()
	const routes = (Reflect.getMetadata(ROUTES_KEY, target) as RouteDef[]) || []

	for (const route of routes) {
		const instance = new target()
		const handler = (instance as any)[route.handlerName].bind(instance)

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
				router.get(route.path, ...middlewares, wrappedHandler)
				break
			case 'post':
				router.post(route.path, ...middlewares, wrappedHandler)
				break
			case 'put':
				router.put(route.path, ...middlewares, wrappedHandler)
				break
			case 'patch':
				router.patch(route.path, ...middlewares, wrappedHandler)
				break
			case 'delete':
				router.delete(route.path, ...middlewares, wrappedHandler)
				break
		}
	}
	Object.defineProperty(target.prototype, 'router', {
		value: router,
		writable: true
	})
}

export function Get(path: string): MethodDecorator {
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
export function Post(path: string): MethodDecorator {
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

export function Patch(path: string): MethodDecorator {
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
export function Put(path: string): MethodDecorator {
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

export function Delete(path: string): MethodDecorator {
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
