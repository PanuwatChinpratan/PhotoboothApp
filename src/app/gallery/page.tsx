'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Photo {
  id: string;
  caption: string | null;
  url: string;      // Cloudinary URL
  width: number;
  height: number;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((d) => setPhotos(d.photos as Photo[]))
      .catch(console.error);
  }, []);

  return (
    <main className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
      {photos.map((p) => (
        <Image
          key={p.id}
          src={p.url}
          alt={p.caption ?? 'photo'}
          width={p.width || 300}     // กันพลาดถ้าบางรูปไม่มี meta
          height={p.height || 300}
           unoptimized
          className="rounded object-cover"
        />
      ))}
    </main>
  );
}
