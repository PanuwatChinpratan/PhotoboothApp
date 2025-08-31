import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GridSkeletonProps {
  columns: number;
}

export function GridSkeleton({ columns }: GridSkeletonProps) {
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
