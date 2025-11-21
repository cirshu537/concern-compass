import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Star, Eye, Users } from 'lucide-react';

export default function StudentDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            Student Documentation
          </h1>
          <p className="text-muted-foreground">Complete guide to the concern management system</p>
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
              <p><strong className="text-foreground">Step-by-Step Process:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Click "Raise" button on your dashboard</li>
                <li>Select appropriate category:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li><strong>Trainer Related:</strong> Training quality, teaching methods</li>
                    <li><strong>Facility/Campus:</strong> Infrastructure, cleanliness, equipment</li>
                    <li><strong>Personal/Institute:</strong> Personal issues affecting learning</li>
                    <li><strong>Content Quality:</strong> Course material concerns</li>
                    <li><strong>Platform Issues:</strong> Technical problems</li>
                    <li><strong>Payment/Membership:</strong> Billing concerns</li>
                    <li><strong>Support/Communication:</strong> Admin response issues</li>
                    <li><strong>Safety/Wellbeing:</strong> Security or health concerns</li>
                  </ul>
                </li>
                <li>Provide clear title and detailed description</li>
                <li>Choose anonymous (recommended) or public submission</li>
                <li>Attach evidence if applicable (optional)</li>
                <li>Submit and track status in "Status" section</li>
              </ol>
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
              <p><strong className="text-foreground">Anonymous (Recommended):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your identity is hidden from all staff and trainers</li>
                <li>Protected from potential bias or retaliation</li>
                <li>Only Main Admin can reveal identity (in extreme cases)</li>
                <li>Best for sensitive or trainer-related concerns</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Public:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your identity is visible to assigned staff</li>
                <li>May enable direct communication and faster resolution</li>
                <li>Use when comfortable being identified</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Concern Status & Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Status Stages:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-status-logged">Logged:</strong> Concern submitted, awaiting assignment</li>
                <li><strong className="text-status-in-process">In Process:</strong> Staff/trainer working on resolution</li>
                <li><strong className="text-status-fixed">Fixed:</strong> Issue resolved successfully</li>
                <li><strong className="text-status-cancelled">Cancelled:</strong> Invalid or duplicate concern</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Trainer-Related Concerns:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Automatically assigned to trainers in your branch</li>
                <li>When trainer replies, concern is marked as Fixed</li>
                <li><strong>You CAN:</strong> View trainer's response in the Reviews section</li>
                <li><strong>You CANNOT:</strong> Rate or review the trainer's response back</li>
                <li>Read-only access to trainer feedback - no scoring allowed</li>
                <li>This protects honest, one-way feedback from students to trainers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                Rating & Review System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">When to Rate:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>After <strong>NON-trainer</strong> concerns are marked as Fixed or Cancelled</li>
                <li>Rating is optional but helps improve service quality</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Rating Options (For Staff-Handled Concerns Only):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-status-fixed">👍 Positive:</strong> Issue resolved satisfactorily, staff responsive</li>
                <li><strong className="text-muted-foreground">— Neutral:</strong> Partial resolution or acceptable outcome</li>
                <li><strong className="text-destructive">👎 Negative:</strong> Poor handling, unresolved, or unprofessional</li>
              </ul>
              
              <div className="mt-4 bg-accent/10 p-4 rounded-lg border border-accent/20">
                <p className="font-semibold text-foreground mb-2">📋 Trainer-Related Concerns - Special Rules:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                  <li><strong>You CAN SEE:</strong> Trainer's response to your concern in the Reviews section</li>
                  <li><strong>You CANNOT:</strong> Rate the trainer's response (no positive/negative/neutral buttons)</li>
                  <li><strong>One-Way Feedback:</strong> You give feedback to trainers, but don't rate their replies</li>
                  <li><strong>Why?</strong> This prevents retaliation and maintains honest feedback environment</li>
                  <li><strong>Read Only:</strong> Review the trainer's explanation without scoring it</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Credit System - Earn Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">How to Earn Credits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>+20 Credits:</strong> When staff rates your concern positively</li>
                <li><strong>+20 Credits:</strong> When you give positive feedback to staff</li>
                <li>Both student and staff earn credits for positive interactions</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">Credit Purpose:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reflects quality engagement with the system</li>
                <li>Demonstrates responsible concern reporting</li>
                <li>May unlock future benefits and rewards</li>
                <li>Viewable in your profile</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Negative Events & Temporary Bans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">What Causes Negative Events?</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Submitting false or misleading concerns</li>
                <li>Repeated frivolous complaints</li>
                <li>Staff rates your concern negatively for being invalid</li>
                <li>Concern marked as Cancelled due to careless reporting</li>
              </ul>
              <p className="mt-4"><strong className="text-destructive font-semibold">Ban System:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>3 Negative Events (Lifetime)</strong> = Temporary ban from raising concerns</li>
                <li>Ban prevents submitting new concerns until resolved</li>
                <li>Appeals can be made by contacting administration</li>
                <li>Demonstrates importance of quality over quantity</li>
              </ul>
              <p className="mt-4 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <strong className="text-destructive">Prevention Tips:</strong> Always provide accurate details, include evidence when possible, and only submit legitimate concerns. Think carefully before raising an issue.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                Privacy & Identity Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Your Privacy Rights:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Anonymous concerns protect your identity by default</li>
                <li>Staff and trainers cannot see who submitted the concern</li>
                <li>Only Main Admin can reveal identity in exceptional circumstances:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Serious safety concerns requiring intervention</li>
                    <li>Legal or disciplinary requirements</li>
                    <li>Cannot resolve without knowing identity</li>
                  </ul>
                </li>
                <li>Identity revelation is logged and monitored for accountability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Best Practices for Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Choose the correct category for your concern</li>
                <li>✅ Provide clear, detailed descriptions</li>
                <li>✅ Attach evidence (screenshots, photos) when possible</li>
                <li>✅ Use anonymous mode for sensitive issues</li>
                <li>✅ Track status regularly and respond to staff inquiries</li>
                <li>✅ Provide honest, constructive feedback</li>
                <li>❌ Avoid submitting duplicate concerns</li>
                <li>❌ Don't exaggerate or provide false information</li>
                <li>❌ Don't use the system to settle personal disputes</li>
                <li>❌ Don't rate negatively without valid reason</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
