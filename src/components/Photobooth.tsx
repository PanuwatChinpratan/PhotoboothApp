"use client";

import { useEffect, useRef, useState } from "react";
import { drawWithWatermark } from "@/lib/watermark";

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [captured, setCaptured] = useState(false);

  // เปิดกล้องตอนเข้า + ปิดกล้องตอนออกจากหน้า
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play?.().catch(() => {});
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      const v = videoRef.current;
      const s = (v?.srcObject as MediaStream | null) ?? stream;
      s?.getTracks().forEach((t) => t.stop());
      if (v) {
        v.pause?.();
        
        v.srcObject = null;
      }
    };
    // อย่าใส่ dependency อื่น เพื่อไม่ให้เปิดกล้องซ้ำ
  }, []);

  // หลัง Save แล้ว setCaptured(false) → ให้พยายามเล่นวิดีโออีกครั้ง
  useEffect(() => {
    if (!captured) {
      const v = videoRef.current;
      if (!v) return;

      let s = (v.srcObject as MediaStream | null) ?? stream;
      const dead =
        !s || s.getVideoTracks().every((t) => t.readyState === "ended");

      if (dead) {
        // เผื่อบางกรณี (เช่น iOS/แท็บพัก) track สิ้นสุด ให้เปิดใหม่
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(async (ns) => {
            setStream(ns);
            if (videoRef.current) {
              videoRef.current.srcObject = ns;
              await videoRef.current.play?.().catch(() => {});
            }
          })
          .catch(console.error);
      } else {
        // มี stream อยู่แล้ว แค่ ensure เล่นต่อ
        v.srcObject = s;
        v.play?.().catch(() => {});
      }
    }
  }, [captured, stream]);

  const capture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `brightness(${100 + brightness}%)`;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
    drawWithWatermark(ctx);
    setCaptured(true); // ซ่อนวิดีโอชั่วคราวเพื่อแสดงภาพที่ถ่าย
  };

  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  const save = async () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png").split(",")[1];
    await fetch("/api/photos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: data,
        meta: { width: canvas.width, height: canvas.height },
      }),
    });
    // กลับสู่โหมดกล้อง → useEffect(captured) จะทำงานและเล่นวิดีโอให้
    setCaptured(false);
  };

  return (
    <div className="space-y-4">
      {!captured && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded"
        />
      )}
      <canvas ref={canvasRef} className="rounded" />
      <div className="flex items-center gap-2">
        <button onClick={rotateLeft}>⟲</button>
        <button onClick={rotateRight}>⟳</button>
        <input
          type="range"
          min="-50"
          max="50"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
        />
        {!captured ? (
          <button onClick={capture}>Capture</button>
        ) : (
          <button onClick={save}>Save</button>
        )}
      </div>
    </div>
  );
}
