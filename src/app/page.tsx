"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Photobooth Demo</h1>
      <div className="space-x-4">
        <Link href="/photobooth" className="underline">
          Photobooth
        </Link>
        <Link href="/gallery" className="underline">
          Gallery
        </Link>
        {session ? (
          <button
            className="underline"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            Sign Out
          </button>
        ) : (
          <Link href="/auth/login" className="underline">
            Login
          </Link>
        )}
      </div>
    </main>
  );
}
