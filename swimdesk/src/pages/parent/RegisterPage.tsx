import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Waves } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({
  fullName: z.string().min(2, "Zadaj celé meno"),
  email: z.string().email("Neplatný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { slug } = useParams<{ slug: string }>()
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password, data.fullName)
    setLoading(false)
    if (error) {
      toast.error("Registrácia zlyhala", { description: error.message })
    } else {
      toast.success("Účet vytvorený! Skontroluj si email na potvrdenie.")
      navigate(`/${slug}/prihlasenie`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Waves className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Registrácia</h1>
          <p className="text-sm text-muted-foreground text-center">
            Vytvor rodičovský účet pre SwimDesk
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Celé meno</Label>
            <Input id="fullName" placeholder="Ján Novák" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jan@priklad.sk" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Heslo</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Zopakuj heslo</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Registrujem…" : "Vytvoriť účet"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Už máš účet?{" "}
          <Link to={`/${slug}/prihlasenie`} className="text-primary font-medium hover:underline">
            Prihlásiť sa
          </Link>
        </p>
      </div>
    </div>
  )
}
