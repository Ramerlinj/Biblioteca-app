import { useEffect, useState } from "react";
import { User, Mail, Calendar, BookOpen } from "lucide-react";
import { Books } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { ContentLoading } from "@/components/LoadingState";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalFavorites: 0,
    totalGenres: 0,
    booksThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentUser = user;

    let ignore = false;

    async function loadStats() {
      setIsLoading(true);
      try {
        const nextStats = await Books.stats(currentUser.id);
        if (!ignore) {
          setStats(nextStats);
        }
      } catch (error) {
        console.warn("No se pudo cargar estadísticas de perfil", error);
        if (!ignore) {
          setStats({
            totalBooks: 0,
            totalFavorites: 0,
            totalGenres: 0,
            booksThisMonth: 0,
          });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      ignore = true;
    };
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return <ContentLoading label="Cargando perfil" />;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif font-semibold text-foreground mb-8">
        Perfil
      </h1>

      <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2
              data-testid="text-username"
              className="text-xl font-semibold text-foreground"
            >
              {user.name}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span data-testid="text-email">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              Miembro desde{" "}
              {new Date(user.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Tu colección</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Libros", value: stats.totalBooks },
            { label: "Favoritos", value: stats.totalFavorites },
            { label: "Géneros", value: stats.totalGenres },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 bg-muted/50 rounded-xl">
              <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-serif font-bold text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
