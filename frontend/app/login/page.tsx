"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

type FieldErrors = { email?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const result = schema.safeParse({ email, password });
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const errs = z.flattenError(result.error).fieldErrors;
    setFieldErrors({
      email: errs.email?.[0],
      password: errs.password?.[0],
    });
    return false;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 401) {
        setServerError("Email o contraseña incorrectos.");
        return;
      }
      if (!res.ok) {
        setServerError("Ocurrió un error. Intentá de nuevo.");
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setServerError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={`rounded-lg border px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none transition focus:ring-2 focus:ring-zinc-900 ${
                fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
              }`}
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password..."
              className={`rounded-lg border px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none transition focus:ring-2 focus:ring-zinc-900 ${
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
              }`}
            />
            {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
          </div>

          {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
          {success && <p className="text-xs text-green-600 text-center">¡Bienvenido! Redirigiendo...</p>}

          <button
            type="submit"
            disabled={loading || success}
            className="mt-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition-all cursor-pointer hover:bg-zinc-600 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-2">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
