import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Waves } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    setLoading(false)
    if (error) {
      toast.error("Chyba", { description: error.message })
    } else {
      toast.success("Heslo bolo zmenené")
      navigate(`/${slug}/prihlasenie`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Waves className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Nové heslo</h1>
          <p className="text-sm text-muted-foreground text-center">
            Zadaj nové heslo pre tvoj účet.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nové heslo</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Zopakuj heslo</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Ukladám…" : "Uložiť heslo"}
          </Button>
        </form>
      </div>
    </div>
  )
}
