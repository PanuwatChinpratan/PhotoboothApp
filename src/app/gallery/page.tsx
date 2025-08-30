'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Photo {
  id: string;
  caption: string | null;
  url: string;     
  width: number;
  height: number;
}

export default function GalleryPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/photos');
        if (res.status === 401) {
          router.push('/auth/login');
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
      }
    })();
  }, [router]);


  return (
    <main className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
      {photos.map((p) => (
        <Image
          key={p.id}
          src={p.url}
          alt={p.caption ?? 'photo'}
          width={p.width || 300}     
          height={p.height || 300}
          priority
         
          className="rounded object-cover"
        />
      ))}
    </main>
  );
}
