import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Photo {
  id: string;
  caption: string | null;
  url: string;
  width: number;
  height: number;
}

export function useGallery() {
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [columns, setColumns] = useState<number>(3);
  const [selected, setSelected] = useState<Photo | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/photos");
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET /api/photos ${res.status}: ${text}`);
      }
      const data: { photos: Photo[]; nextCursor?: string } = await res.json();
      setPhotos(data.photos);
    } catch (e) {
      console.error(e);
      toast.warning('โหลดรูปไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    photos,
    loading,
    query,
    setQuery,
    columns,
    setColumns,
    selected,
    setSelected,
    load,
  } as const;
}
