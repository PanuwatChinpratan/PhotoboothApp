'use client';

import { useEffect, useRef, useState } from 'react';
import { drawWithWatermark } from '@/lib/watermark';

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(setStream).catch(console.error);
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const capture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = `brightness(${100 + brightness}%)`;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
    drawWithWatermark(ctx);
    setCaptured(true);
  };

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  const save = async () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL('image/png').split(',')[1];
    await fetch('/api/photos', {
      method: 'POST',
        credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
           
        image: data,
        meta: { width: canvas.width, height: canvas.height },
      }),
    });
    setCaptured(false);
  };

  return (
    <div className="space-y-4">
      {!captured && <video ref={videoRef} autoPlay className="rounded" />}
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
