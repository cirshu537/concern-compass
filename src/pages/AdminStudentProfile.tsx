import { useNavigate, useParams } from 'react-router-dom';
import { StudentProfile } from '@/components/StudentProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminStudentProfile() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const handleBack = () => {
    // Navigate back in browser history, or to dashboard if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/main-admin/dashboard');
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Student not found</h2>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <StudentProfile studentId={studentId} onBack={handleBack} />
      </main>
    </div>
  );
}
