"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const submit = async () => {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    router.push("/auth/login");
  };
  return (
    <main className="p-4 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl">Register</h1>
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
      <button className="border px-4 py-2" onClick={submit}>
        Register
      </button>
      <p className="text-sm">
        Have an account?{" "}
        <Link href="/auth/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
