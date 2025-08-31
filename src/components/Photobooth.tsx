"use client";

import { useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CameraView from "@/components/photobooth/CameraView";
import ShotEditor from "@/components/photobooth/ShotEditor";
import useCamera from "@/hooks/useCamera";

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shot, setShot] = useState<ImageBitmap | null>(null);

  const { stream, loading, openCamera } = useCamera(videoRef);

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    const bitmap = await createImageBitmap(video);
    setShot(bitmap);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-12">
        <CameraView
          videoRef={videoRef}
          loading={loading}
          stream={stream}
          openCamera={openCamera}
          capture={capture}
        />
        <ShotEditor shot={shot} onRetake={() => setShot(null)} />
      </div>
    </TooltipProvider>
  );
}
