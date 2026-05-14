"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(!!localStorage.getItem("token"));
    sync();
    window.addEventListener("auth", sync);
    return () => window.removeEventListener("auth", sync);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50">
      <Link href="/" className="text-sm font-semibold text-zinc-100 tracking-tight hover:text-indigo-400 transition-colors">
        Pay & Pray
      </Link>
      {loggedIn ? (
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
        >
          Sign out
        </button>
      ) : (
        <div className="flex gap-2">
          {pathname !== "/login" && (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          )}
          {pathname !== "/register" && (
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
            >
              Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
