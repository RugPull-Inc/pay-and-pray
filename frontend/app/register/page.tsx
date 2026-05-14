"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type Errors = {
  email?: string;
  password?: string;
  confirm?: string;
  server?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const result = schema.safeParse({ email, password, confirm });
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs = z.flattenError(result.error).fieldErrors;
    setErrors({
      email: errs.email?.[0],
      password: errs.password?.[0],
      confirm: errs.confirm?.[0],
    });
    return false;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 409) {
        setErrors({ server: "Este email ya está registrado." });
        return;
      }
      if (!res.ok) {
        setErrors({ server: "Error al crear la cuenta. Intentá de nuevo." });
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth"));
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setErrors({ server: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pay & Pray</h1>
          <p className="text-zinc-400">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`rounded-xl border px-3.5 py-3 text-sm text-zinc-100 bg-zinc-900 outline-none transition focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/40"
                  : "border-zinc-700 focus:ring-indigo-500/40 focus:border-indigo-500/60"
              }`}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password..."
              className={`rounded-xl border px-3.5 py-3 text-sm text-zinc-100 bg-zinc-900 outline-none transition focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500/40"
                  : "border-zinc-700 focus:ring-indigo-500/40 focus:border-indigo-500/60"
              }`}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-zinc-400">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="password..."
              className={`rounded-xl border px-3.5 py-3 text-sm text-zinc-100 bg-zinc-900 outline-none transition focus:ring-2 ${
                errors.confirm
                  ? "border-red-500 focus:ring-red-500/40"
                  : "border-zinc-700 focus:ring-indigo-500/40 focus:border-indigo-500/60"
              }`}
            />
            {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
          </div>

          {errors.server && (
            <p className="text-xs text-red-400 text-center">{errors.server}</p>
          )}
          {success && (
            <p className="text-xs text-green-400 text-center">Account created! Redirecting...</p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed py-3 text-sm font-medium text-white transition-colors cursor-pointer"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
