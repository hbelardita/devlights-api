import { ZodError } from "zod";
export function formatZodError(error: ZodError) {
  return {
    message: "Validation failed",
    issues: error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
      code: issue.code,
    })),
  };
}
