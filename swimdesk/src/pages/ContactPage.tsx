import { MapPin, Mail, Phone } from "lucide-react"
import { useClubContext } from "@/contexts/ClubContext"
import { useClubContent } from "@/hooks/useClubContent"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  const { club } = useClubContext()
  const { data: content } = useClubContent(club?.id)

  const get = (section: string) => content?.find((c) => c.section === section)?.content_sk ?? ""

  const address = get("contact_address")
  const email = get("contact_email")
  const phone = get("contact_phone")

  return (
    <div className="container py-12 md:py-20 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Kontakt</h1>
        <p className="text-muted-foreground text-lg">Radi odpovieme na vaše otázky.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {address && (
          <Card>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Adresa</p>
                <p className="text-muted-foreground">{address}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {email && (
          <Card>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Email</p>
                <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
              </div>
            </CardContent>
          </Card>
        )}

        {phone && (
          <Card>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Telefón</p>
                <a href={`tel:${phone}`} className="text-primary hover:underline">{phone}</a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Simple contact form */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-5">Napíšte nám</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Phase 2: connect to email sending via Supabase Edge Function
              alert("Správa odoslaná! (Phase 2 feature)")
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">Meno</label>
              <input
                type="text"
                required
                placeholder="Vaše meno"
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="vas@email.sk"
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Správa</label>
              <textarea
                required
                rows={5}
                placeholder="Čo vás zaujíma?"
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Odoslať správu
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
