export enum UserRole {
	ADMIN = 'admin',
	USER = 'user'
}

export interface IUser {
	displayName: string
	email: string
	password: string
	role: UserRole
	publicKey: string
	verifyPassword(password: string): boolean
	createdAt?: Date
	updatedAt?: Date
}
