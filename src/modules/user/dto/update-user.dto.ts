import { z } from 'zod'

export const updateUserDTO = z.object({
	fullName: z.string().min(1, { message: 'Full name is required' }).optional(),
	email: z.email({ message: 'Invalid email address' }).optional(),
	password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(),
	address: z.string().optional(),
	phone_number: z.string().optional(),
	role: z.enum(['admin', 'student', 'teacher']).optional(),
	dob: z.string().optional()
})

export type UpdateUserDTO = z.infer<typeof updateUserDTO>
