import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Star } from 'lucide-react';

export default function TrainerDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => navigate('/trainer/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            Trainer Documentation
          </h1>
          <p className="text-muted-foreground">Learn how to manage trainer-related concerns</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Role as a Trainer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>As a trainer, you are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Responding to student concerns about training quality</li>
                <li>Providing feedback and explanations for student issues</li>
                <li>Maintaining professional standards in all interactions</li>
                <li>Working collaboratively with staff and administration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Handling Trainer-Related Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">When a concern is raised:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review the student's concern carefully (identity is protected)</li>
                <li>Provide a thoughtful and professional response</li>
                <li>When you reply, the concern is automatically marked as fixed</li>
                <li>Focus on addressing the issue constructively</li>
              </ul>
              <p className="mt-4">Remember: Student identity remains anonymous to protect them from any potential bias.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Credit System for Trainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Earning Credits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>+20 credits when you receive positive feedback from students</li>
                <li>Credits reflect quality of your training and responsiveness</li>
                <li>High credits demonstrate excellence in teaching</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                High Alert System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">What is High Alert?</strong></p>
              <p>If you receive 3 or more negative reviews within a week:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will be placed on High Alert status</li>
                <li>You must report to administration immediately</li>
                <li>This is an opportunity to address any training issues</li>
                <li>Administration will work with you to improve</li>
              </ul>
              <p className="mt-4"><strong className="text-destructive font-semibold">Remember:</strong> Negative feedback is a learning opportunity to enhance your teaching methods.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Respond to concerns promptly and professionally</li>
                <li>Take all feedback seriously, even if negative</li>
                <li>Use concerns as opportunities for self-improvement</li>
                <li>Maintain confidentiality of student concerns</li>
                <li>Collaborate with staff when needed for complex issues</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
