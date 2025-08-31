import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

export function useCamera(videoRef: RefObject<HTMLVideoElement>) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const pathname = usePathname();

  const stopCamera = () => {
    const s = streamRef.current;
    try {
      s?.getTracks().forEach((t) => t.stop());
      const v = videoRef.current;
      if (v) {
        v.pause?.();
        v.srcObject = null;
      }
    } finally {
      streamRef.current = null;
      setStream(null);
    }
  };

  const openCamera = async () => {
    if (streamRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("Camera API not available");
      return;
    }
    try {
      setLoading(true);
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      setStream(s);
      const v = videoRef.current;
      if (v) {
        v.srcObject = s;
        try {
          await v.play?.();
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        streamRef.current = s;
        setStream(s);
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          try {
            await v.play?.();
          } catch {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
      const v = videoRef.current;
      if (v) {
        v.pause?.();
        v.srcObject = null;
      }
      streamRef.current = null;
      setStream(null);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/photobooth") {
      stopCamera();
    }
  }, [pathname]);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) stopCamera();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return { stream, loading, openCamera, stopCamera };
}

export default useCamera;
