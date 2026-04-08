import { useEffect, useState } from "react";
import { BookOpen, Heart, Tag, TrendingUp } from "lucide-react";
import { Books } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { BookCard } from "@/components/BookCard";
import { ContentLoading } from "@/components/LoadingState";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-serif font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalFavorites: 0,
    totalGenres: 0,
    booksThisMonth: 0,
  });
  const [recent, setRecent] = useState<
    Awaited<ReturnType<typeof Books.recent>>
  >([]);
  const [genres, setGenres] = useState<
    Awaited<ReturnType<typeof Books.genreStats>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentUser = user;

    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [nextStats, nextRecent, nextGenres] = await Promise.all([
          Books.stats(currentUser.id),
          Books.recent(currentUser.id),
          Books.genreStats(currentUser.id),
        ]);

        if (!ignore) {
          setStats(nextStats);
          setRecent(nextRecent);
          setGenres(nextGenres);
        }
      } catch (error) {
        console.warn("No se pudo cargar dashboard desde Firestore", error);
        if (!ignore) {
          setStats({
            totalBooks: 0,
            totalFavorites: 0,
            totalGenres: 0,
            booksThisMonth: 0,
          });
          setRecent([]);
          setGenres([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return <ContentLoading label="Cargando dashboard" />;
  }

  const maxGenreCount =
    genres.length > 0 ? Math.max(...genres.map((g) => g.count)) : 1;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Resumen de tu colección</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total de libros"
          value={stats.totalBooks}
          icon={BookOpen}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Favoritos"
          value={stats.totalFavorites}
          icon={Heart}
          color="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
        />
        <StatCard
          label="Géneros"
          value={stats.totalGenres}
          icon={Tag}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          label="Este mes"
          value={stats.booksThisMonth}
          icon={TrendingUp}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Añadidos recientemente
          </h2>
          {recent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recent.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Aún no tienes libros.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Por género
          </h2>
          {genres.length > 0 ? (
            <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm space-y-3">
              {genres.map(({ genre, count }) => (
                <div key={genre} data-testid={`genre-stat-${genre}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{genre}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Sin datos de género.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
