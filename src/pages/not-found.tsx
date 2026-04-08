import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-border/70 bg-card/95 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-100/50 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Página no encontrada
          </div>

          <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Error 404
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
                Esta ruta se perdió entre los libros.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                La página que estás buscando no existe, cambió de dirección o
                fue archivada. Puedes volver a tu biblioteca o regresar a la
                página anterior.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/">
                  <Button data-testid="button-go-home" className="gap-2">
                    <Home className="h-4 w-4" />
                    Volver al inicio
                  </Button>
                </Link>

                <Button
                  data-testid="button-go-back"
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="gap-2 cursor-poin"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Regresar
                </Button>
              </div>
            </div>

            <div className="flex items-end justify-start md:justify-end">
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 sm:h-44 sm:w-44">
                <Compass className="h-16 w-16 text-primary/80 sm:h-20 sm:w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
