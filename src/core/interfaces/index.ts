import { NextFunction, Request, Response, Router } from 'express'

export interface IBaseController {
	router: Router
}

export interface IApplicationMiddleware {
	handle(req: Request, res: Response, next: NextFunction): any
}
