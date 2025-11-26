import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Complaint } from '@/types/database';

export default function BranchAdminAllComplaints() {
  const navigate = useNavigate();
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'list' | 'detail'>('list');

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
    setSelectedView('detail');
  };

  if (selectedView === 'detail' && selectedComplaintId) {
    navigate(`/complaint/${selectedComplaintId}`);
    return null;
  }

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
          hideInternalFilters={false}
          onComplaintClick={handleComplaintClick}
        />
      </div>
    </div>
  );
}
