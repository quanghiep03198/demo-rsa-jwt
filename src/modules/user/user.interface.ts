import { IBaseSchema } from '../_base/base.schema.interface'

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user'
}

export interface IUser extends IBaseSchema {
	email: string
	displayName: string
	password: string
	role: UserRole
	publicKey: string
	verifyPassword(password: string): boolean
}
