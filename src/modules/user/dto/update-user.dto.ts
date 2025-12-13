import { z } from 'zod'
import { createUserDTO } from './create-user.dto'

export const updateUserDTO = createUserDTO.partial().omit({ email: true })

export type UpdateUserDTO = z.infer<typeof updateUserDTO>
