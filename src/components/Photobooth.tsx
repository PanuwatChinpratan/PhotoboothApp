"use client";

import { useEffect, useRef, useState } from "react";
import { drawWithWatermark } from "@/lib/watermark";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// icons
import { Camera, Save, RotateCcw, RotateCw, Sun } from "lucide-react";

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);

  // ค่าปรับแต่งของ "รูปที่ถ่าย"
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [brightness, setBrightness] = useState(0); // -50..50

  // เก็บรูปที่ถ่ายไว้
  const [shot, setShot] = useState<ImageBitmap | null>(null);

  // เปิดกล้องตอนเข้า + ปิดกล้องตอนออกจากหน้า
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      const v = videoRef.current;
      const s = (v?.srcObject as MediaStream | null) ?? stream;
      s?.getTracks().forEach((t) => t.stop());
      v?.pause?.();
      if (v) {
        v.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // วาดรูปที่ถ่ายลง canvas ทางขวา ตามค่าปรับแต่งปัจจุบัน
  const renderShot = () => {
    if (!shot || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    // เตรียมขนาด canvas = ขนาดรูปที่ถ่าย
    canvas.width = shot.width;
    canvas.height = shot.height;

    ctx.save();

    // ตั้ง filter ตามความสว่าง
    ctx.filter = `brightness(${100 + brightness}%)`;

    // หมุนรูป
    const rad = (rotation * Math.PI) / 180;

    // ถ้าหมุน 90/270 องศา ต้องสลับ w/h ของพื้นที่วาด
    if (rotation === 90 || rotation === 270) {
      canvas.width = shot.height;
      canvas.height = shot.width;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);

    // วาดรูปให้อยู่ตรงกลาง
    const drawW =
      rotation === 90 || rotation === 270 ? shot.height : shot.width;
    const drawH =
      rotation === 90 || rotation === 270 ? shot.width : shot.height;

    // สำหรับ 90/270 เราหมุนแล้ว ดังนั้นใช้ขนาดเดิมของ bitmap วาด
    ctx.drawImage(shot, -shot.width / 2, -shot.height / 2);

    ctx.restore();

    // ลายน้ำ (ใช้หลังจาก transform/brightness)
    drawWithWatermark(ctx);
  };

  // ทุกครั้งที่ shot/rotation/brightness เปลี่ยน ให้ re-render
  useEffect(() => {
    renderShot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot, rotation, brightness]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;

    // สร้าง ImageBitmap จากเฟรมวิดีโอ (เร็วกว่าดึงเป็น base64 แล้วแปลง)
    const bitmap = await createImageBitmap(video);
    setShot(bitmap); // ตั้งรูปที่ถ่าย
    // renderShot() จะถูกเรียกผ่าน useEffect
  };

  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  const save = async () => {
    if (!canvasRef.current || !shot) return;
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png").split(",")[1];
    await fetch("/api/photos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: data,
        meta: {
          width: canvas.width,
          height: canvas.height,
          rotation,
          brightness,
        },
      }),
    });
    // เคลียร์รูปที่ถ่าย เพื่อกลับไปถ่ายใหม่
    setShot(null);
    setRotation(0);
    setBrightness(0);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-12">
        {/* ซ้าย: กล้องสด + ปุ่ม Capture */}
        <Card className="md:col-span-7 lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg">Live Camera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border bg-muted/30 p-2">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-xl"
              >
                <div className="relative h-full w-full">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </AspectRatio>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={capture} disabled={loading || !stream}>
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
          </CardFooter>
        </Card>

        {/* ขวา: รูปที่ถ่าย + Controls + Save */}
        <Card className="md:col-span-5 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg">Edit & Save</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Preview ของรูปที่ถ่าย (canvas) */}
            <div className="rounded-2xl border bg-muted/30 p-2">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-xl"
              >
                <canvas
                  ref={canvasRef}
                  className="h-full w-full object-contain"
                />
              </AspectRatio>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm">Rotation</Label>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={rotateLeft}
                        disabled={!shot}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate -90°</TooltipContent>
                  </Tooltip>
                  <span className="w-14 text-right text-sm tabular-nums">
                    {rotation}°
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={rotateRight}
                        disabled={!shot}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate +90°</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brightness" className="text-sm">
                    Brightness
                  </Label>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 opacity-70" />
                    <span className="w-14 text-right text-sm tabular-nums">
                      {brightness > 0 ? `+${brightness}` : brightness}
                    </span>
                  </div>
                </div>
                <Slider
                  id="brightness"
                  value={[brightness]}
                  min={-50}
                  max={50}
                  step={1}
                  onValueChange={(v: number[]) => {
                    setBrightness(v[0] ?? 0);
                  }}
                  disabled={!shot}
                />
                <p className="text-xs text-muted-foreground">
                  -50 (มืด) → 0 (ปกติ) → +50 (สว่าง)
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center gap-2">
            <Button
              className="w-full md:w-auto"
              onClick={save}
              disabled={!shot}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            {shot && (
              <Button
                className="w-full md:w-auto"
                variant="outline"
                onClick={() => {
                  setShot(null);
                  setRotation(0);
                  setBrightness(0);
                  const c = canvasRef.current;
                  const ctx = c?.getContext("2d");
                  if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
                }}
              >
                ถ่ายใหม่
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
