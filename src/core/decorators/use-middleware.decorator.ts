import { RequestHandler } from 'express'
import 'reflect-metadata'

const MIDDLEWARE_KEY = 'middlewares'

/**
 * Decorator to apply middlewares to a route handler
 * @param middlewares - Array of Express middlewares

```typescript
@UseMiddleware(authMiddleware, validationMiddleware)
@Get('/profile')
async getProfile(req: Request, res: Response) {
  // handler code
}
```
 */
export function UseMiddleware(...middlewares: RequestHandler[]): MethodDecorator {
	return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		// Get existing middlewares from metadata
		const existingMiddlewares: RequestHandler[] =
			Reflect.getMetadata(MIDDLEWARE_KEY, target.constructor, propertyKey) || []

		// Add new middlewares
		const allMiddlewares = [...existingMiddlewares, ...middlewares]

		// Save metadata
		Reflect.defineMetadata(MIDDLEWARE_KEY, allMiddlewares, target.constructor, propertyKey)

		return descriptor
	}
}

/**
 * Helper function để lấy middlewares từ metadata
 */
export function getMiddlewares(target: any, propertyKey: string | symbol): RequestHandler[] {
	return Reflect.getMetadata(MIDDLEWARE_KEY, target, propertyKey) || []
}
