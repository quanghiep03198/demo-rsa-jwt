import { RequestHandler } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import { HttpStatusCode } from '../constants'

interface ExceptionFilter {
	catch: (error: Error | HttpError, args: Parameters<RequestHandler>) => unknown
}

export class AllExceptionFilter implements ExceptionFilter {
	catch(error: Error | HttpError, args: Parameters<RequestHandler>) {
		const [, res] = args
		if (createHttpError.isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.statusCode
			})
		} else {
			return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
				message: error.message,
				statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR
			})
		}
	}
}
