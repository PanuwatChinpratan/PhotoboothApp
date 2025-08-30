'use client';

import { useEffect, useState } from 'react';

interface Photo { id: number; caption: string | null; data: string; }

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((d) => {
        setPhotos(
          d.photos.map((p: any) => ({
            ...p,
            data: btoa(String.fromCharCode(...p.data.data)),
          })),
        );
      });
  }, []);

  return (
    <main className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
      {photos.map((p) => (
        <img key={p.id} src={`data:image/png;base64,${p.data}`} className="rounded" />
      ))}
    </main>
  );
}
