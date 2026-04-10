import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Books } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ContentLoading } from "@/components/LoadingState";

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
  "Otro",
];

const schema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  author: z.string().min(1, "El autor es obligatorio"),
  genre: z.string().min(1, "El género es obligatorio"),
  editorial: z.string().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 5)
    .optional()
    .or(z.literal("")),
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
}

export default function BookFormPage({ mode }: Props) {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoadingBook, setIsLoadingBook] = useState(mode === "edit");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      editorial: "",
      year: "",
      isbn: "",
      description: "",
      coverUrl: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !user) {
      setIsLoadingBook(false);
      return;
    }

    const currentUser = user;

    let ignore = false;

    async function loadBook() {
      setIsLoadingBook(true);
      try {
        const existingBook = await Books.get(params.id, currentUser.id);

        if (!ignore && existingBook) {
          if (existingBook.userId !== currentUser.id) {
            toast({
              title: "No tienes permisos para editar este libro",
              variant: "destructive",
            });
            setLocation(`/books/${params.id}`);
            return;
          }

          form.reset({
            title: existingBook.title,
            author: existingBook.author,
            genre: existingBook.genre,
            editorial: existingBook.editorial ?? "",
            year: existingBook.year ?? "",
            isbn: existingBook.isbn ?? "",
            description: existingBook.description ?? "",
            coverUrl: existingBook.coverUrl ?? "",
          });
        }
      } catch (error) {
        console.error("No se pudo cargar el libro", error);
        if (!ignore) {
          toast({
            title: "No se pudo cargar el libro",
            description: "Intenta de nuevo en unos segundos.",
            variant: "destructive",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoadingBook(false);
        }
      }
    }

    void loadBook();

    return () => {
      ignore = true;
    };
  }, [form, mode, params.id, user]);

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Sesión no disponible",
        description: "Vuelve a iniciar sesión para guardar el libro.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: values.title,
      author: values.author,
      genre: values.genre,
      editorial: values.editorial || undefined,
      year: values.year ? Number(values.year) : undefined,
      isbn: values.isbn || undefined,
      description: values.description || undefined,
      coverUrl: values.coverUrl || undefined,
    };

    try {
      if (mode === "create") {
        const newBook = await Books.create(user.id, payload);
        toast({ title: "Libro añadido correctamente" });
        setLocation(`/books/${newBook.id}`);
        return;
      }

      await Books.update(params.id, user.id, payload);
      toast({ title: "Libro actualizado correctamente" });
      setLocation(`/books/${params.id}`);
    } catch (error) {
      console.error("No se pudo guardar el libro", error);

      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : "";

      const description =
        code === "firestore/offline"
          ? "No hay conexión a internet. Reconecta e inténtalo de nuevo."
          : code === "firestore/timeout"
            ? "Firebase tardó demasiado en responder. Intenta otra vez."
            : "Revisa tu conexión e inténtalo de nuevo.";

      toast({
        title: "No se pudo guardar el libro",
        description,
        variant: "destructive",
      });
    }
  }

  const coverUrl = form.watch("coverUrl");

  if (isLoadingBook) {
    return <ContentLoading label="Cargando formulario" />;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={mode === "edit" ? `/books/${params.id}` : "/"}
        data-testid="link-back"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {mode === "edit" ? "Volver al libro" : "Volver a la biblioteca"}
      </Link>

      <h1 className="text-2xl font-serif font-semibold text-foreground mb-8">
        {mode === "create" ? "Añadir libro" : "Editar libro"}
      </h1>

      <div className="flex gap-8">
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-title"
                          placeholder="Título del libro"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autor *</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-author"
                          placeholder="Nombre del autor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-genre">
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENRES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="editorial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editorial</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-editorial"
                          placeholder="Editorial"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-year"
                          type="number"
                          placeholder="Año de publicación"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-isbn"
                          placeholder="ISBN"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>URL de portada</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-cover-url"
                          placeholder="https://..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-description"
                          placeholder="Breve descripción del libro..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="button-submit"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {mode === "create" ? "Añadir libro" : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setLocation(mode === "edit" ? `/books/${params.id}` : "/")
                  }
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {coverUrl && (
          <div className="shrink-0 w-40 hidden sm:block">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Vista previa
            </p>
            <div className="rounded-xl overflow-hidden aspect-2/3 bg-muted border border-border">
              <img
                src={coverUrl}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
