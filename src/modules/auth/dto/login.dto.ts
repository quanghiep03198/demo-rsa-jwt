import z from 'zod'

export const loginDTO = z.object({
	email: z.email(),
	password: z.string()
})

export type LoginDTO = z.infer<typeof loginDTO>
