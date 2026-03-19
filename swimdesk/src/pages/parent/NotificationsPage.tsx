import { useParentPushNotifications } from "@/hooks/useParentPushNotifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, BellOff, Smartphone } from "lucide-react"

export default function NotificationsPage() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useParentPushNotifications()

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifikácie</h1>

      {!isSupported ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex gap-3 items-start">
              <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Push notifikácie nie sú podporované</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pre push notifikácie je potrebný iOS 16.4+ s nainštalovanou aplikáciou na ploche, alebo moderný Android prehliadač.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                {isSubscribed ? (
                  <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {isSubscribed ? "Notifikácie sú zapnuté" : "Notifikácie sú vypnuté"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isSubscribed
                      ? "Budeme ťa informovať o dôležitých správach od klubu."
                      : "Zapni notifikácie a dostávaj správy od klubu priamo do zariadenia."}
                  </p>
                </div>
              </div>
              <Button
                variant={isSubscribed ? "outline" : "default"}
                size="sm"
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={isLoading}
                className="shrink-0"
              >
                {isLoading ? "…" : isSubscribed ? "Vypnúť" : "Zapnúť"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Notifikácie sú odosielané iba klubom, v ktorom je vaše dieťa zaregistrované.
      </p>
    </div>
  )
}
