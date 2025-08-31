import { useEffect, useRef, useState } from "react";
import { drawWithWatermark } from "@/lib/watermark";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, RotateCw, Save, Sun } from "lucide-react";
import { toast } from "sonner";
interface ShotEditorProps {
  shot: ImageBitmap | null;
  onRetake: () => void;
}

export default function ShotEditor({ shot, onRetake }: ShotEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);

  const renderShot = () => {
    if (!shot || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = shot.width;
    canvas.height = shot.height;

    ctx.save();
    ctx.filter = `brightness(${100 + brightness}%)`;

    const rad = (rotation * Math.PI) / 180;
    if (rotation === 90 || rotation === 270) {
      canvas.width = shot.height;
      canvas.height = shot.width;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(shot, -shot.width / 2, -shot.height / 2);
    ctx.restore();

    drawWithWatermark(ctx);
  };

  useEffect(() => {
    renderShot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot, rotation, brightness]);

  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

const save = async () => {
  if (!canvasRef.current || !shot) return;

  const canvas = canvasRef.current;
  const data = canvas.toDataURL("image/png").split(",")[1];

  try {
    const res = await fetch("/api/photos", {
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

    if (!res.ok) {
      // ถ้า API error
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    // ✅ สำเร็จ
    onRetake();
    setRotation(0);
    setBrightness(0);
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  } catch (err) {
    console.error("Save failed:", err);
   
    toast.error("บันทึกรูปไม่สำเร็จ กรุณา login");
  }
};


  const retake = () => {
    onRetake();
    setRotation(0);
    setBrightness(0);
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  return (
    <Card className="md:col-span-5 lg:col-span-5">
      <CardHeader>
        <CardTitle className="text-lg">Edit & Save</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border bg-muted/30 p-2">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
          </AspectRatio>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm">Rotation</Label>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={rotateLeft} disabled={!shot}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate -90°</TooltipContent>
              </Tooltip>
              <span className="w-14 text-right text-sm tabular-nums">{rotation}°</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={rotateRight} disabled={!shot}>
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
              onValueChange={(v: number[]) => setBrightness(v[0] ?? 0)}
              disabled={!shot}
            />
            <p className="text-xs text-muted-foreground">
              -50 (มืด) → 0 (ปกติ) → +50 (สว่าง)
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button className="w-full md:w-auto" onClick={save} disabled={!shot}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        {shot && (
          <Button className="w-full md:w-auto" variant="outline" onClick={retake}>
            ถ่ายใหม่
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
