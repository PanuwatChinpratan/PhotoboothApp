"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// tiny cookie reader
function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}
function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

export default function FlashToast() {
  useEffect(() => {
    const v = readCookie("flash-photobooth");
    if (v === "login-required-photobooth") {
      console.log("flash-photobooth", v);
      alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      // toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      clearCookie("flash-photobooth");
    }
  }, []);
  return null;
}
