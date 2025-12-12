import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { UserRole } from '../../user/user.interface'
import { HttpStatusCode } from '../../../core/constants'

/**
 * Middleware to check role of authenticated user
 * @param allowedRoles - Array of allowed roles
 * @returns Express middleware function
 */
export const roleBaseMiddleware = (allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if user is authenticated
			const user = (req as any).user

			if (!user) {
				throw createHttpError.Unauthorized('Authentication required')
			}

			// Check if user role exists
			if (!user.role) {
				throw createHttpError.Forbidden('User role not found')
			}

			// Check if user has one of the allowed roles
			if (!allowedRoles.includes(user.role)) {
				throw createHttpError.Forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
			}

			// If all checks pass, proceed to the next middleware/handler
			next()
		} catch (error) {
			return res
				.status(HttpStatusCode.UNAUTHORIZED)
				.json({ message: 'Invalid access token', statusCode: HttpStatusCode.UNAUTHORIZED })
		}
	}
}

/**
 * Middleware only allow admin access
 */
export const adminOnly = roleBaseMiddleware([UserRole.ADMIN])

/**
 * Middleware allow both admin and user access
 */
export const authenticated = roleBaseMiddleware([UserRole.ADMIN, UserRole.USER])
