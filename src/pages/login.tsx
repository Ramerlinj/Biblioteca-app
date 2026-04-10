import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, CircleAlert } from "lucide-react";
import { Auth } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await Auth.login(values.email, values.password);
    if ("error" in result) {
      toast({ title: result.error, variant: "destructive" });
    } else {
      setAuth(result);
      setLocation("/");
    }
  }

  async function onSendRecovery() {
    setIsSendingRecovery(true);
    try {
      const result = await Auth.requestPasswordRecovery(recoveryEmail);
      if ("error" in result) {
        toast({
          title: "No se pudo enviar el correo",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Correo enviado",
        description:
          "Revisa bandeja principal, Spam y Promociones para restablecer la contraseña.",
      });
      setIsRecoveryOpen(false);
    } finally {
      setIsSendingRecovery(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:flex-1 bg-linear-to-br from-primary to-green-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img
            src="/POMARAY_LOGO.webp"
            alt="POMARAY"
            className="h-6 w-6 object-contain"
          />
          <span className="font-serif text-2xl font-semibold text-white">
            Biblioteca
          </span>
        </div>
        <div>
          <blockquote className="text-white/90 font-serif text-2xl leading-relaxed mb-4">
            "A reader lives a thousand lives before he dies. The man who never
            reads lives only one."
          </blockquote>
          <cite className="text-white/60 text-sm">— George R.R. Martin</cite>
        </div>
        <div className="text-white/40 text-sm">
          Tu colección personal de libros
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img
              src="/POMARAY_LOGO.webp"
              alt="POMARAY"
              className="h-5 w-5 object-contain"
            />
            <span className="font-serif text-xl font-semibold text-foreground">
              Biblioteca
            </span>
          </div>

          <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">
            Bienvenido de vuelta
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Accede a tu colección personal
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          data-testid="input-email"
                          type="email"
                          placeholder="tu@email.com"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          data-testid="input-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                data-testid="button-submit"
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                Entrar
              </Button>
            </form>
          </Form>

          <div className="mt-3 text-right">
            <button
              type="button"
              className="text-sm text-primary font-medium hover:underline"
              onClick={() => {
                setRecoveryEmail(form.getValues("email") || "");
                setIsRecoveryOpen(true);
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              data-testid="link-register"
              className="text-primary font-medium hover:underline"
            >
              Regístrate
            </Link>
          </p>

          <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Recuperar contraseña</DialogTitle>
                <DialogDescription>
                  Ingresa tu correo y te enviaremos un enlace para recuperar
                  acceso.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="recovery-email"
                >
                  Email
                </label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={recoveryEmail}
                  onChange={(event) => setRecoveryEmail(event.target.value)}
                />
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
                <CircleAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Si no lo ves en menos de 2 minutos, revisa Spam y Promociones.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecoveryOpen(false)}
                  disabled={isSendingRecovery}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => void onSendRecovery()}
                  disabled={isSendingRecovery}
                >
                  {isSendingRecovery ? "Enviando..." : "Enviar enlace"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
