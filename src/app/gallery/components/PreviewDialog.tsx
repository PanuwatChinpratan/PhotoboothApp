import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Photo } from "../useGallery";

interface PreviewDialogProps {
  photo: Photo | null;
  onClose: () => void;
}

export function PreviewDialog({ photo, onClose }: PreviewDialogProps) {
  return (
    <Dialog open={!!photo} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate">{photo?.caption || "Preview"}</DialogTitle>
        </DialogHeader>
        {photo && (
          <AspectRatio ratio={photo.width && photo.height ? photo.width / photo.height : 1}>
            <Image
              src={photo.url}
              alt={photo.caption ?? "photo"}
              fill
              sizes="90vw"
              className="rounded-md object-contain"
              priority
            />
          </AspectRatio>
        )}
      </DialogContent>
    </Dialog>
  );
}
