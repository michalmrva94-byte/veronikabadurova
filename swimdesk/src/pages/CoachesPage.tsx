import { motion } from "framer-motion"
import { useClubContext } from "@/contexts/ClubContext"
import { useCoaches } from "@/hooks/useCoaches"
import { CoachCard } from "@/components/club/CoachCard"
import { Waves } from "lucide-react"

export default function CoachesPage() {
  const { club } = useClubContext()
  const { data: coaches, isLoading } = useCoaches(club?.id)

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Trénerský tím</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Naši tréneri sú srdcom klubu. Každý plavec má za sebou niekoho, kto verí v jeho potenciál.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
        </div>
      )}

      {!isLoading && (!coaches || coaches.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <Waves className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Informácie o trénerskrom tíme budú čoskoro doplnené.</p>
        </div>
      )}

      {coaches && coaches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach, i) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <CoachCard coach={coach} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
