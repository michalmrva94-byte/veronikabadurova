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
  email: z.string().email("Neplatný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)
    if (error) {
      toast.error("Prihlásenie zlyhalo", { description: error.message })
    } else {
      navigate(`/${slug}/rodic`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Waves className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Prihlásenie</h1>
          <p className="text-sm text-muted-foreground text-center">
            Prihlás sa do rodičovského portálu SwimDesk
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jan@priklad.sk" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Heslo</Label>
              <Link to={`/${slug}/zabudnute-heslo`} className="text-xs text-primary hover:underline">
                Zabudol/a si heslo?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Prihlasujem…" : "Prihlásiť sa"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Nemáš účet?{" "}
          <Link to={`/${slug}/registracia`} className="text-primary font-medium hover:underline">
            Zaregistruj sa
          </Link>
        </p>
      </div>
    </div>
  )
}
