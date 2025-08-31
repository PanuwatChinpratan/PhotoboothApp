import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryControlsProps {
  loading: boolean;
  columns: number;
  setColumns: (c: number) => void;
  query: string;
  setQuery: (q: string) => void;
  onReload: () => void;
}

export function GalleryControls({
  loading,
  columns,
  setColumns,
  query,
  setQuery,
  onReload,
}: GalleryControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onReload} disabled={loading}>
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
  );
}
