import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Star } from 'lucide-react';

export default function StudentDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            App Documentation
          </h1>
          <p className="text-muted-foreground">Learn how the concern system works</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                How to Raise a Concern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>1. Click the "Raise" button on your dashboard</p>
              <p>2. Select the appropriate category for your concern</p>
              <p>3. Provide a clear title and detailed description</p>
              <p>4. Choose whether to submit anonymously (recommended for privacy)</p>
              <p>5. Submit and track the status in the "Status" section</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Credit System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Earning Credits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>+20 credits when your concern is resolved positively</li>
                <li>+20 credits when you give positive feedback to staff</li>
                <li>Credits represent positive contributions to the community</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Using Credits:</strong></p>
              <p>Credits serve as a measure of your positive engagement with the system and may unlock future benefits.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Negative Events & Bans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">What are Negative Events?</strong></p>
              <p>Negative events are recorded when:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You submit false or misleading concerns</li>
                <li>Staff rates your concern negatively due to careless reporting</li>
                <li>You provide negative feedback without valid reason</li>
              </ul>
              <p className="mt-4"><strong className="text-destructive font-semibold">Ban System:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>3 negative events = Temporary ban from raising concerns</li>
                <li>Bans can be appealed by contacting administration</li>
                <li>Focus on quality over quantity when raising concerns</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                Rating System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>After your concern is resolved, you can rate the resolution:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-status-fixed">Positive (+1):</strong> Issue resolved satisfactorily</li>
                <li><strong className="text-muted-foreground">Neutral (0):</strong> Issue partially resolved</li>
                <li><strong className="text-destructive">Negative (-1):</strong> Issue not resolved or handled poorly</li>
              </ul>
              <p className="mt-4">Your feedback helps improve the system and holds staff accountable.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Anonymous vs. Public Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Anonymous (Default):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your identity is hidden from staff and trainers</li>
                <li>Provides safety for sensitive concerns</li>
                <li>Recommended for most situations</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Public:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your identity is visible to staff</li>
                <li>May lead to faster, more personalized resolution</li>
                <li>Use when you're comfortable being identified</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}