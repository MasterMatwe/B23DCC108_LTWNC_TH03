"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeCallbackUrl } from "@/lib/auth-navigation";
import type { LoginFormState } from "@/types";

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";

  if (!email || !password) {
    return { email, error: "Email hoặc mật khẩu không đúng" };
  }

  try {
    return await signIn("credentials", {
      email,
      password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        email,
        error:
          error.type === "CredentialsSignin"
            ? "Email hoặc mật khẩu không đúng"
            : "Chưa thể đăng nhập. Vui lòng thử lại.",
      };
    }
    // Next.js redirects are control-flow exceptions and must be rethrown.
    throw error;
  }
}
