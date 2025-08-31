import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { Photo } from "../useGallery";

interface PhotoGridProps {
  photos: Photo[];
  columns: number;
  onSelect: (photo: Photo) => void;
}

export function PhotoGrid({ photos, columns, onSelect }: PhotoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 md:grid-cols-3",
        columns === 4 && "grid-cols-2 md:grid-cols-4",
      )}
    >
      {photos.map((p) => (
        <figure key={p.id} className="group relative overflow-hidden rounded-xl border bg-background">
          <AspectRatio ratio={p.width && p.height ? p.width / p.height : 1}>
            <Image
              src={p.url}
              alt={p.caption ?? "photo"}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              priority
            />
          </AspectRatio>
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {p.caption || "—"}
          </figcaption>
          <button
            type="button"
            onClick={() => onSelect(p)}
            className="absolute inset-0"
            aria-label="ดูรูปแบบเต็ม"
          />
        </figure>
      ))}
    </div>
  );
}
