import { Navigate } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import SDLayout from '@/components/layout/SDLayout';

interface Props {
  children: React.ReactNode;
}

export default function SDProtectedRoute({ children }: Props) {
  const { user, profile, isLoading } = useSDAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={SD_ROUTES.LOGIN} replace />;
  }

  // User is authenticated but has no profile yet → onboarding
  if (!profile) {
    return <Navigate to={SD_ROUTES.ONBOARDING} replace />;
  }

  return <SDLayout>{children}</SDLayout>;
}
