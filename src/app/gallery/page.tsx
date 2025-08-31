"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { GalleryHeader } from "./components/GalleryHeader";
import { GalleryControls } from "./components/GalleryControls";
import { PhotoGrid } from "./components/PhotoGrid";
import { PreviewDialog } from "./components/PreviewDialog";
import { GridSkeleton } from "./components/GridSkeleton";
import { EmptyState } from "./components/EmptyState";
import { useGallery } from "./useGallery";

export default function GalleryPage() {
  const {
    photos,
    loading,
    query,
    setQuery,
    columns,
    setColumns,
    selected,
    setSelected,
    load,
  } = useGallery();

  const filtered = useMemo(() => {
    if (!query.trim()) return photos;
    const q = query.toLowerCase();
    return photos.filter((p) => (p.caption || "photo").toLowerCase().includes(q));
  }, [photos, query]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <GalleryHeader count={photos.length} />
        <GalleryControls
          loading={loading}
          columns={columns}
          setColumns={setColumns}
          query={query}
          setQuery={setQuery}
          onReload={load}
        />
      </div>

      <Separator className="my-4" />

      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">{filtered.length} รูป</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <GridSkeleton columns={columns} />
          ) : filtered.length === 0 ? (
            <EmptyState onRetry={load} />
          ) : (
            <PhotoGrid photos={filtered} columns={columns} onSelect={setSelected} />
          )}
        </CardContent>
      </Card>

      <PreviewDialog photo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
