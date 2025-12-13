import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { UserRole } from '../../user/user.interface'
import { HttpStatusCode } from '../../../core/constants'
import { IApplicationMiddleware } from '../../../core/interfaces'
import { Service } from 'typedi'

/**
 * Base role middleware class
 * Can be used with constructor to pass allowed roles
 */
@Service()
export class RoleBaseMiddleware implements IApplicationMiddleware {
	constructor(private readonly allowedRoles: UserRole[]) {}

	async handle(req: Request, res: Response, next: NextFunction) {
		try {
			// Check if user is authenticated
			const user = req['user']

			if (!user) throw createHttpError.Unauthorized('Authentication required')

			// Check if user role exists
			if (!user.role) throw createHttpError.Forbidden('User role not found')

			// Check if user has one of the allowed roles
			if (!this.allowedRoles.includes(user.role))
				throw createHttpError.Forbidden(`Access denied. Required roles: ${this.allowedRoles.join(', ')}`)

			// If all checks pass, proceed to the next middleware/handler
			next()
		} catch (error) {
			return res
				.status(HttpStatusCode.UNAUTHORIZED)
				.json({ message: (error as Error).message, statusCode: HttpStatusCode.UNAUTHORIZED })
		}
	}

	/**
	 * Factory method to create role middleware with specific roles
	 * @param roles - Array of allowed roles
	 * @returns Class constructor that can be used in decorator
	 */
	static requireRoles(...roles: UserRole[]) {
		return class extends RoleBaseMiddleware {
			constructor() {
				super(roles)
			}
		}
	}
}

/**
 * Middleware only allow admin access
 */
export const AdminOnly = RoleBaseMiddleware.requireRoles(UserRole.ADMIN)

/**
 * Middleware allow both admin and user access
 */
export const Authenticated = RoleBaseMiddleware.requireRoles(UserRole.ADMIN, UserRole.USER)

/**
 * Legacy function-based middleware for backward compatibility
 * @param allowedRoles - Array of allowed roles
 * @returns Express middleware function
 */
export const roleBaseMiddleware = (allowedRoles: UserRole[]) => {
	const middleware = new RoleBaseMiddleware(allowedRoles)
	return (req: Request, res: Response, next: NextFunction) => middleware.handle(req, res, next)
}

/**
 * Legacy exports for backward compatibility
 */
export const adminOnly = roleBaseMiddleware([UserRole.ADMIN])
export const authenticated = roleBaseMiddleware([UserRole.ADMIN, UserRole.USER])
