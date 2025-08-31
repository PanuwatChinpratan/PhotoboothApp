import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-muted/30 p-10 text-center">
      <div className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-muted">
        <ImageIcon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-medium">ยังไม่มีรูปที่จะแสดง</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">อัปโหลดรูปภาพใหม่ หรือกดรีเฟรชเพื่อลองดึงข้อมูลอีกครั้ง</p>
      <Button onClick={onRetry}>ลองใหม่</Button>
    </div>
  );
}
