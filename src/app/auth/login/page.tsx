"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="p-4 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl">Login</h1>
      <input
        className="border p-2 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="border px-4 py-2"
        onClick={() =>
          signIn("credentials", { email, password, callbackUrl: "/" })
        }
      >
        Login
      </button>
      <p className="text-sm">
        No account?{" "}
        <Link href="/auth/register" className="underline">
          Register
        </Link>
      </p>
    </main>
  );
}
