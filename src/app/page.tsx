"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">📸 Photobooth Demo</h1>
        <p className="text-muted-foreground">
          ทดลองถ่ายรูปและจัดการ Gallery ของคุณ
        </p>
      </div>

      {/* Nav Section */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/photobooth">Photobooth</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/gallery">Gallery</Link>
          </Button>
          {session ? (
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              Sign Out
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Optional info section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <p>
              สวัสดี <span className="font-semibold">{session.user?.name}</span> 👋
              คุณสามารถเข้าถึง Photobooth และ Gallery ได้เลย
            </p>
          ) : (
            <p>
              กรุณา <Link href="/auth/login" className="underline">Login</Link>{" "}
              เพื่อเริ่มใช้งาน Photobooth และบันทึกรูปภาพของคุณ
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
