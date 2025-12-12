export enum UserRole {
	ADMIN = 'admin',
	USER = 'user'
}

export interface IUser {
	displayName: string
	email: string
	password: string
	role: UserRole
	dob?: string
	createdAt?: Date
	updatedAt?: Date
}
