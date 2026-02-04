import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export default function MyTrainingsPage() {
  // Placeholder - no bookings yet
  const upcomingBookings: any[] = [];
  const pastBookings: any[] = [];

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Moje tréningy</h1>
          <p className="text-muted-foreground">
            Prehľad vašich rezervácií
          </p>
        </div>

        {/* Upcoming trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nadchádzajúce</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  Nemáte žiadne naplánované tréningy
                </p>
                <Button asChild>
                  <Link to={ROUTES.CALENDAR}>Rezervovať tréning</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bookings will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">História</CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Zatiaľ nemáte žiadnu históriu tréningov
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Past bookings will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
