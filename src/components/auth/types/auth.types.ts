import type { z } from "zod"

import type { signInSchema } from "../validations/auth.validations"

export type SignInSchemaType = z.infer<typeof signInSchema>