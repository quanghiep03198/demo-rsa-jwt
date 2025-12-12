import { RequestHandler } from 'express'
import { z } from 'zod'
import { HttpStatusCode } from '../constants'

/**
 * @decorator
 * @param validator
 * @returns {MethodDecorator}
 */
export function UseZodValidationPipe<T extends z.ZodPipe<any>>(validator: T): MethodDecorator {
	return function (_target: Object, _property: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: Parameters<RequestHandler>) {
			const [req, res, next] = args
			try {
				const result = await validator.parseAsync(req.body)
				if (result) req.body = result
				originalMethod.apply(this, [req, res, next])
			} catch (error) {
				if (error instanceof z.ZodError) {
					return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
						message: error.issues[0].message,
						statusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
						stack: error.issues
					})
				}
			}
		}

		return descriptor
	}
}
