import { useNavigate } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BranchAdminAllComplaints() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleComplaintClick = (complaintId: string) => {
    navigate(`/complaint/${complaintId}?from=branch-all-complaints&returnView=complaints`);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="outline"
          onClick={() => navigate('/branch-admin/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <ComplaintsList
          filterByBranch={profile?.branch || ''}
          hideInternalFilters={false}
          onComplaintClick={(complaint) => handleComplaintClick(complaint.id)}
        />
      </div>
    </div>
  );
}
