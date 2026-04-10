import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function getQueryParam(name: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) ?? "";
}

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const oobCode = useMemo(() => getQueryParam("oobCode"), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!oobCode) {
      toast({
        title: "Enlace inválido",
        description: "Este enlace de recuperación no es válido.",
        variant: "destructive",
      });
      return;
    }

    if (password.trim().length < 6) {
      toast({
        title: "Contraseña débil",
        description: "Debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setIsDone(true);
      toast({ title: "Contraseña actualizada" });
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : "";

      const description =
        code === "auth/expired-action-code"
          ? "El enlace expiró. Solicita uno nuevo."
          : code === "auth/invalid-action-code"
            ? "El enlace no es válido o ya fue usado."
            : "No se pudo actualizar la contraseña.";

      toast({
        title: "Error al restablecer",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card shadow-sm p-6">
        <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Elige una nueva contraseña para tu cuenta.
        </p>

        {isDone ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <p className="text-sm text-emerald-200">
                Tu contraseña se actualizó correctamente.
              </p>
            </div>
            <Button className="w-full" onClick={() => setLocation("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
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
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Actualizando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
