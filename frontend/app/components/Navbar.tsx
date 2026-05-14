"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <nav className="fixed top-0 right-0 p-4 z-50">
      {loggedIn ? (
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
        >
          Sign out
        </button>
      ) : (
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
