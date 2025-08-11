import { ZodError } from "zod"

export type ErrorResponse = {
  error: string
  details?: unknown
}

export class AppError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status = 400, details?: unknown) {
    super(message)
    this.name = "AppError"
    this.status = status
    this.details = details
  }
}

export function toErrorResponse(error: unknown): { status: number; body: ErrorResponse } {
  if (error instanceof AppError) {
    return { status: error.status, body: { error: error.message, details: error.details } }
  }
  if (error instanceof ZodError) {
    return { status: 422, body: { error: "Validation error", details: error.flatten() } }
  }
  return { status: 500, body: { error: "Internal server error" } }
}


