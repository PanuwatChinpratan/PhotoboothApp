import { type RefObject } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  loading: boolean;
  stream: MediaStream | null;
  openCamera: () => void;
  capture: () => void;
}

export default function CameraView({
  videoRef,
  loading,
  stream,
  openCamera,
  capture,
}: CameraViewProps) {
  return (
    <Card className="md:col-span-7 lg:col-span-7">
      <CardHeader>
        <CardTitle className="text-lg">Live Camera</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border bg-muted/30 p-2">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
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
        <Button size="lg" variant="secondary" onClick={openCamera} disabled={!!stream || loading}>
          Open Camera
        </Button>
        <Button size="lg" onClick={capture} disabled={loading || !stream}>
          <Camera className="mr-2 h-5 w-5" />
          Capture
        </Button>
      </CardFooter>
    </Card>
  );
}
