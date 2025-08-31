import { GalleryVerticalEnd } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryHeaderProps {
  count: number;
}

export function GalleryHeader({ count }: GalleryHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
        <GalleryVerticalEnd className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Gallery</h1>
        <p className="text-sm text-muted-foreground">รูปภาพทั้งหมดจากระบบของคุณ</p>
      </div>
      <Badge variant="secondary" className="ml-1">{count}</Badge>
    </div>
  );
}
