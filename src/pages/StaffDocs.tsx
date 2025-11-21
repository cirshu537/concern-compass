import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Users } from 'lucide-react';

export default function StaffDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            Staff Documentation
          </h1>
          <p className="text-muted-foreground">Learn how to manage and resolve student concerns</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Role as Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>As a staff member, you are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processing and resolving student concerns in your branch</li>
                <li>Evaluating concern validity and taking appropriate action</li>
                <li>Communicating with students about their concerns</li>
                <li>Collaborating with branch admins and other staff</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Processing Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Workflow:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review newly logged concerns in your branch</li>
                <li>Update status to "In Process" when you start working on it</li>
                <li>Investigate and take necessary action</li>
                <li>Mark as "Fixed" when resolved or "Cancelled" if invalid</li>
                <li>Provide feedback explaining your resolution</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Credit and Rating System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Earning Credits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>+20 credits when students rate your work positively</li>
                <li>Credits reflect quality of service and responsiveness</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Rating Student Concerns:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-status-fixed">Positive:</strong> Valid concern, handled well</li>
                <li><strong className="text-muted-foreground">Neutral:</strong> Minor issue or partial resolution</li>
                <li><strong className="text-destructive">Negative:</strong> False/misleading concern</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                High Alert and Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Performance Monitoring:</strong></p>
              <p>If you receive 3 or more negative reviews within a week:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will be placed on High Alert status</li>
                <li>You must report to your branch admin</li>
                <li>Administration will review your cases</li>
                <li>This is an opportunity for improvement and support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Respond to concerns within 24-48 hours when possible</li>
                <li>Investigate thoroughly before marking as cancelled</li>
                <li>Be fair and objective in your ratings</li>
                <li>Document your actions and decisions</li>
                <li>Communicate clearly with students</li>
                <li>Escalate complex issues to branch admin</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
