import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/hooks/useAuth';

export default function ComplaintDetailsPage() {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();

  const handleBack = () => {
    const from = searchParams.get('from');
    const returnView = searchParams.get('returnView');

    if (from === 'chat') {
      navigate('/chat');
    } else if (from === 'branch-all-complaints') {
      navigate('/branch-admin/all-complaints');
    } else if (from === 'main-all-complaints') {
      navigate('/main-admin/dashboard?view=complaints');
    } else {
      // Navigate back to appropriate dashboard
      if (profile?.role === 'branch_admin') {
        navigate('/branch-admin/dashboard');
      } else if (profile?.role === 'main_admin') {
        navigate('/main-admin/dashboard');
      } else if (profile?.role === 'staff') {
        navigate('/staff/dashboard');
      } else if (profile?.role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  if (!complaintId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ComplaintDetails 
          complaintId={complaintId}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
