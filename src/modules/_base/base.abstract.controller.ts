import { Router } from 'express'
import { IBaseController } from '../../core/interfaces'

export abstract class BaseAbstractController implements IBaseController {
	private __router__: Router = Router()

	public get router(): Router {
		return this.__router__
	}
}
