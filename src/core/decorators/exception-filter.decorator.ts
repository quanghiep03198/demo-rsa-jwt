import { RequestHandler } from 'express'
import { AllExceptionFilter } from '../filters/exception.filter'

/**
 * @decorator
 * @param validator
 * @returns {MethodDecorator}
 */
export function UseExceptionFilter(): MethodDecorator {
	return function (_target: Object, _property: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		const originalMethod = descriptor.value
		descriptor.value = function (...args: Parameters<RequestHandler>) {
			try {
				originalMethod.apply(this, args)
			} catch (error) {
				return new AllExceptionFilter().catch(error as Error, args)
			}
		}
		return descriptor
	}
}
