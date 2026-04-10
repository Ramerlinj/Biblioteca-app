import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
  BookOpen,
  Lock,
} from "lucide-react";
import { Auth, Books } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { ContentLoading } from "@/components/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalFavorites: 0,
    totalGenres: 0,
    booksThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.trim().length < 6) {
      toast({
        title: "Nueva contraseña inválida",
        description: "Debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Revisa la confirmación de la nueva contraseña.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await Auth.changeOwnPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Contraseña actualizada" });
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : "";

      const description =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "La contraseña actual no es correcta."
          : code === "auth/weak-password"
            ? "La nueva contraseña es demasiado débil."
            : "No se pudo cambiar la contraseña. Intenta nuevamente.";

      toast({
        title: "Error al cambiar contraseña",
        description,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
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

      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm mt-6">
        <h3 className="font-semibold text-foreground mb-4">Seguridad</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Puedes cambiar únicamente la contraseña de tu propia cuenta.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Contraseña actual"
              className="pl-9 pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowCurrentPassword((value) => !value)}
              aria-label={
                showCurrentPassword
                  ? "Ocultar contrasena"
                  : "Mostrar contrasena"
              }
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Nueva contraseña"
              className="pl-9 pr-10"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNewPassword((value) => !value)}
              aria-label={
                showNewPassword ? "Ocultar contrasena" : "Mostrar contrasena"
              }
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmar nueva contraseña"
              className="pl-9 pr-10"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword
                  ? "Ocultar contrasena"
                  : "Mostrar contrasena"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
