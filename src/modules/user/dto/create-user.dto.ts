import { z } from 'zod'

export const createUserDTO = z.object({
	displayName: z.string().min(1, { message: 'Full name is required' }),
	email: z.email({ message: 'Invalid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters long' })
})

export type CreateUserDTO = z.infer<typeof createUserDTO>
