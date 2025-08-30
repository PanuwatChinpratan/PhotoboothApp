

import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Photobooth Demo</h1>
      <div className="space-x-4">
        <Link href="/photobooth" className="underline">Photobooth</Link>
        <Link href="/gallery" className="underline">Gallery</Link>
        <Link href="/auth/login" className="underline">Login</Link>
      </div>
    </main>
  );
}
