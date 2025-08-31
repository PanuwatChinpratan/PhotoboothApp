"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const FLASH_MESSAGES: Record<string, string> = {
  "login-required": "กรุณาเข้าสู่ระบบก่อนใช้งาน",
  // เติม key อื่น ๆ ได้ตามต้องการ
};

export default function FlashFromQS() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("flash");
    if (!code) return;

    const msg = FLASH_MESSAGES[code] ?? code;
    toast.error(msg);

    const params = new URLSearchParams(searchParams);
    params.delete("flash");
    const next = params.toString() ? `/?${params}` : `/`;
    router.replace(next);
  }, [router, searchParams]);

  return null;
}
