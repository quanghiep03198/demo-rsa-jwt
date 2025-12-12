import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodType } from 'zod'
import { HttpStatusCode } from '../constants'

/**
 * @deprecated use `UseZodValidationPipe` decorator instead
 */
export class ZodValidation<T> {
	private schema: ZodType<T>

	constructor(schema: ZodType<T>) {
		this.schema = schema
	}

	validator() {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const parsed = await this.schema.parseAsync(req.body)
				req.body = parsed
				return next()
			} catch (error) {
				if (error instanceof ZodError) {
					res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
						message: 'Validation failed',
						error: error.issues
					})
				}

				res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
					message: 'Validation failed',
					error: error instanceof Error ? error.message : error
				})
			}
		}
	}
}
