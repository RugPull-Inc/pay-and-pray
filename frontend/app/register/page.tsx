"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
  confirm: z.string().min(1, "Confirmá tu contraseña."),
}).refine((d) => d.password === d.confirm, {
  message: "Las contraseñas no coinciden.",
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
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setErrors({ server: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
          Crear cuenta
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
                errors.email ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password..."
              className={`rounded-lg border px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none transition focus:ring-2 focus:ring-zinc-900 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
              }`}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm font-medium text-zinc-700">
              Repetir contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="password..."
              className={`rounded-lg border px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none transition focus:ring-2 focus:ring-zinc-900 ${
                errors.confirm ? "border-red-500 focus:ring-red-500" : "border-zinc-300"
              }`}
            />
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
          </div>

          {errors.server && (
            <p className="text-xs text-red-500 text-center">{errors.server}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 text-center">¡Cuenta creada! Ya podés iniciar sesión.</p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="mt-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition-all cursor-pointer hover:bg-zinc-600 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-2">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
