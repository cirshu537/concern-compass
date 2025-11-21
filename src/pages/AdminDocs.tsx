import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Users, MessageSquare, Eye, TrendingUp } from 'lucide-react';

export default function AdminDocs() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleBack = () => {
    if (profile?.role === 'main_admin') {
      navigate('/main-admin/dashboard');
    } else {
      navigate('/branch-admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            {profile?.role === 'main_admin' ? 'Main Admin' : 'Branch Admin'} Documentation
          </h1>
          <p className="text-muted-foreground">Learn how to oversee and manage the concern system</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Administrative Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>As an administrator, you have elevated responsibilities:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Oversee all concerns in your jurisdiction</li>
                <li>Assign staff to handle specific concerns</li>
                <li>Monitor staff and trainer performance</li>
                <li>Manage conversations between teams</li>
                {profile?.role === 'main_admin' && (
                  <li>Reveal anonymous student identities when necessary</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Managing Staff and Trainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Staff Assignment:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review logged concerns and assign to appropriate staff</li>
                <li>Monitor progress and ensure timely resolution</li>
                <li>Reassign if necessary based on workload or expertise</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Performance Monitoring:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Track staff and trainer high alert status</li>
                <li>Review negative event patterns</li>
                <li>Provide support and guidance when needed</li>
                <li>Take corrective action for persistent issues</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversation Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Administrators can initiate conversations for better coordination:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {profile?.role === 'main_admin' && (
                  <li><strong className="text-foreground">Main to Branch:</strong> Discuss branch-specific concerns</li>
                )}
                <li><strong className="text-foreground">Branch to Staff:</strong> Coordinate with your staff team</li>
                <li>Use conversations for complex cases requiring discussion</li>
                <li>Keep communication professional and documented</li>
              </ul>
            </CardContent>
          </Card>

          {profile?.role === 'main_admin' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-destructive" />
                  Identity Revelation (Main Admin Only)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong className="text-destructive">Use with Extreme Caution:</strong></p>
                <p>You have the power to reveal anonymous student identities. Only use this when:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>There is a serious safety concern</li>
                  <li>Legal or disciplinary action is required</li>
                  <li>The concern cannot be resolved without knowing the identity</li>
                </ul>
                <p className="mt-4 text-destructive font-semibold">This action is irreversible and logged for accountability.</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review dashboard statistics regularly</li>
                <li>Address high alert situations promptly</li>
                <li>Maintain open communication with your team</li>
                <li>Document important decisions and actions</li>
                <li>Protect student anonymity whenever possible</li>
                <li>Foster a culture of accountability and improvement</li>
                <li>Use data to identify systemic issues</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
