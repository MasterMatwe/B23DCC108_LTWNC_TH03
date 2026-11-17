"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/(public)/login/actions";
import { Icon } from "@/components/Icon";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, {
    email: "",
  });

  return (
    <form
      className="login-form"
      action={formAction}
      key={state.email}
      aria-busy={pending}
      noValidate
    >
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <div className="login-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Nhập email của bạn"
          defaultValue={state.email}
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>
      <div className="login-field">
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>
      {state.error && (
        <p className="login-error" id="login-error" role="alert">
          {state.error}
        </p>
      )}
      <button
        className="button button-primary login-submit"
        type="submit"
        disabled={pending}
      >
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        <Icon name="arrow-right" />
      </button>
      <p className="login-form-note">
        Dùng tài khoản được cấp để truy cập thư viện.
      </p>
    </form>
  );
}
