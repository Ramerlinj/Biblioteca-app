import { useState, useCallback, useEffect, useMemo } from "react";
import { Search, Filter, Heart, SortAsc, Library } from "lucide-react";
import { Books } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { BooksGridLoading } from "@/components/LoadingState";

const GENRES = [
  "Ficción",
  "No ficción",
  "Ciencia ficción",
  "Fantasía",
  "Romance",
  "Thriller",
  "Historia",
  "Biografía",
  "Autoayuda",
  "Poesía",
];

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [favOnly, setFavOnly] = useState(false);
  const [books, setBooks] = useState<Awaited<ReturnType<typeof Books.list>>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      return;
    }

    const currentUser = user;

    let ignore = false;

    async function loadBooks() {
      setIsLoading(true);
      try {
        const nextBooks = await Books.list({
          userId: currentUser.id,
          sort: "newest",
        });

        if (!ignore) {
          setBooks(nextBooks);
        }
      } catch {
        if (!ignore) {
          setBooks([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      ignore = true;
    };
  }, [user, refreshTick]);

  const filteredBooks = useMemo(() => {
    let next = [...books];

    if (search) {
      const q = search.toLowerCase();
      next = next.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.genre.toLowerCase().includes(q),
      );
    }

    if (genre && genre !== "all") {
      next = next.filter((book) => book.genre === genre);
    }

    if (favOnly) {
      next = next.filter((book) => book.isFavorite);
    }

    next.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      if (sort === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return next;
  }, [books, search, genre, favOnly, sort]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">
            Mi Biblioteca
          </h1>
          <p className="text-muted-foreground">
            {filteredBooks.length} libros en tu colección
          </p>
        </div>
        <Button onClick={() => setLocation("/books/new")} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Añadir libro
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder="Buscar por título, autor o género..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger data-testid="select-genre" className="w-40">
            <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los géneros</SelectItem>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="select-sort" className="w-40">
            <SortAsc className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="az">A - Z</SelectItem>
            <SelectItem value="za">Z - A</SelectItem>
          </SelectContent>
        </Select>

        <Button
          data-testid="button-favorites-filter"
          variant={favOnly ? "default" : "outline"}
          onClick={() => setFavOnly((f) => !f)}
          className={cn(
            "gap-1.5",
            favOnly &&
              "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white",
          )}
        >
          <Heart className={cn("h-4 w-4", favOnly && "fill-current")} />
          Favoritos
        </Button>

        {(search || genre || favOnly || sort !== "newest") && (
          <Button
            variant="ghost"
            data-testid="button-clear-filters"
            onClick={() => {
              setSearch("");
              setGenre("");
              setSort("newest");
              setFavOnly(false);
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <BooksGridLoading />
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onFavoriteToggle={refresh} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm">
            <Library className="h-9 w-9 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search || genre || favOnly
              ? "Sin resultados"
              : "Tu biblioteca está vacía"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            {search || genre || favOnly
              ? "Intenta ajustar los filtros de búsqueda."
              : "Empieza añadiendo tu primer libro a la colección."}
          </p>
        </div>
      )}
    </div>
  );
}
