"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner"

import { cn } from "@/lib/utils";
import { GalleryVerticalEnd, Image as ImageIcon, RefreshCw } from "lucide-react";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [columns, setColumns] = useState<number>(3);
  const [selected, setSelected] = useState<Photo | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return photos;
    const q = query.toLowerCase();
    return photos.filter((p) => (p.caption || "photo").toLowerCase().includes(q));
  }, [photos, query]);

  async function load() {
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
    } catch (e: any) {
      console.error(e);
 
      toast.warning('โหลดรูปไม่สำเร็จ')
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
            <GalleryVerticalEnd className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight md:text-2xl">Gallery</h1>
            <p className="text-sm text-muted-foreground">รูปภาพทั้งหมดจากระบบของคุณ</p>
          </div>
          <Badge variant="secondary" className="ml-1">{photos.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={load} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>รีเฟรช</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Select value={String(columns)} onValueChange={(v: string) => setColumns(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Columns" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[200px] md:w-[260px]">
            <Input
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="ค้นหาจากคำบรรยาย..."
            />
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">{filtered.length} รูป</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Grid */}
          {loading ? (
            <GridSkeleton columns={columns} />
          ) : filtered.length === 0 ? (
            <EmptyState onRetry={load} />
          ) : (
            <div
              className={cn(
                "grid gap-3 md:gap-4",
                columns === 2 && "grid-cols-2",
                columns === 3 && "grid-cols-2 md:grid-cols-3",
                columns === 4 && "grid-cols-2 md:grid-cols-4",
              )}
            >
              {filtered.map((p) => (
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
                  {/* Overlay */}
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {p.caption || "—"}
                  </figcaption>
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="absolute inset-0"
                    aria-label="ดูรูปแบบเต็ม"
                  />
                </figure>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">{selected?.caption || "Preview"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <AspectRatio ratio={selected.width && selected.height ? selected.width / selected.height : 1}>
              <Image
                src={selected.url}
                alt={selected.caption ?? "photo"}
                fill
                sizes="90vw"
                className="rounded-md object-contain"
                priority
              />
            </AspectRatio>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GridSkeleton({ columns }: { columns: number }) {
  const base = columns === 4 ? 8 : columns === 3 ? 9 : 8;
  const items = Array.from({ length: base });
  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 md:grid-cols-3",
        columns === 4 && "grid-cols-2 md:grid-cols-4",
      )}
    >
      {items.map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <Skeleton className="h-40 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
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
