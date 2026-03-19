import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Waves } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({ email: z.string().email("Neplatný email") })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/${slug}/reset-hesla`,
    })
    setLoading(false)
    if (error) {
      toast.error("Chyba", { description: error.message })
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg p-8 text-center">
          <Waves className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Skontroluj email</h1>
          <p className="text-muted-foreground mb-6">
            Poslali sme ti odkaz na obnovenie hesla. Skontroluj si aj priečinok spam.
          </p>
          <Link to={`/${slug}/prihlasenie`} className="text-primary hover:underline text-sm">
            Späť na prihlásenie
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Waves className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Zabudnuté heslo</h1>
          <p className="text-sm text-muted-foreground text-center">
            Zadaj email a pošleme ti odkaz na obnovenie hesla.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jan@priklad.sk" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Odosielam…" : "Obnoviť heslo"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to={`/${slug}/prihlasenie`} className="text-primary hover:underline">
            Späť na prihlásenie
          </Link>
        </p>
      </div>
    </div>
  )
}
