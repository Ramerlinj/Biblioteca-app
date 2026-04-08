import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FullPageLoading({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3 bg-muted/60" />
          <Skeleton className="h-4 w-1/2 bg-muted/60" />
          <Skeleton className="h-24 w-full rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export function BooksGridLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-card-border bg-card p-3 shadow-sm"
        >
          <Skeleton className="aspect-2/3 w-full rounded-lg bg-muted/60" />
          <Skeleton className="mt-3 h-3.5 w-5/6 bg-muted/60" />
          <Skeleton className="mt-2 h-3 w-3/5 bg-muted/60" />
        </div>
      ))}
    </div>
  );
}

export function ContentLoading({
  label = "Cargando contenido",
}: {
  label?: string;
}) {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-52 bg-muted/60" />
        <Skeleton className="h-24 w-full rounded-xl bg-muted/60" />
        <Skeleton className="h-24 w-full rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
