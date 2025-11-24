import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Star, CheckCircle, Users } from 'lucide-react';

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
          <p className="text-muted-foreground">Complete guide to managing trainer-related concerns</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-l-4 border-primary p-6 rounded-lg mb-8">
          <p className="text-foreground leading-relaxed">
            The Brocamp Student Concern System is built to give every student a safe, anonymous, and respectful space to share their concerns. Unlike normal complaint apps, this system focuses on human behavior — encouraging kindness, responsibility, and honest communication between students, staff, and trainers. With smart credit scoring, fair negative tracking, and transparent branch-level monitoring, it ensures issues are handled quickly while also improving the culture inside Brocamp. This is not just a complaint tool — it's a system designed to make the entire learning environment better, one concern at a time.
          </p>
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
              <p>As a trainer, you play a crucial role in the education quality assurance system:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Receive and respond to student concerns about training quality</li>
                <li>Provide explanations and feedback on teaching methods</li>
                <li>Maintain professional standards in all interactions</li>
                <li>Work to continuously improve based on feedback</li>
                <li>Collaborate with staff and administration when needed</li>
              </ul>
              <p className="mt-4 bg-primary/10 p-3 rounded-lg">
                <strong className="text-foreground">Key Principle:</strong> Student concerns are opportunities for growth and improvement, not personal attacks. All feedback is anonymous to ensure honest communication.
              </p>
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
              <p><strong className="text-foreground">Workflow Overview:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Notification:</strong> You'll be notified when a trainer-related concern is raised</li>
                <li><strong>Review:</strong> Access "Student Concerns" on your dashboard to view new concerns</li>
                <li><strong>Student Identity:</strong> Protected - you cannot see who raised the concern</li>
                <li><strong>Respond:</strong> Provide thoughtful, professional response addressing the issue</li>
                <li><strong>Status Change:</strong> When you submit your reply, concern is automatically marked as Noted</li>
                <li><strong>Track:</strong> View your replied concerns in "Handling Concerns" section</li>
              </ol>
              <p className="mt-4 bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                <strong className="text-foreground">Important:</strong> Your reply is visible to the student in the Reviews section, but students CANNOT rate or review your response back (no positive/negative/neutral buttons). Trainers also do NOT rate students - you only provide text explanations. This ensures fair, one-way feedback focused on improvement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-status-noted" />
                Dashboard Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Your Dashboard Has Two Main Sections:</strong></p>
              
              <div className="bg-status-logged/10 p-3 rounded-lg border border-status-logged/20 mt-3">
                <p className="font-semibold text-foreground">Student Concerns (New & Pending)</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Shows trainer-related concerns in "logged" status</li>
                  <li>These are new concerns waiting for your response</li>
                  <li>Red dot indicates count of pending concerns</li>
                  <li>Click to view and reply to these concerns</li>
                </ul>
              </div>

              <div className="bg-status-noted/10 p-3 rounded-lg border border-status-noted/20 mt-3">
                <p className="font-semibold text-foreground">Handling Concerns (Replied)</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Shows concerns in "noted" status</li>
                  <li>These are concerns you've already replied to</li>
                  <li>System automatically moves concerns here after you reply</li>
                  <li>Track and review your past responses</li>
                </ul>
              </div>

              <p className="mt-4"><strong className="text-foreground">Status Flow:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Logged →</strong> New concern appears in "Student Concerns"</li>
                <li><strong>You Reply →</strong> Automatically changes to "Noted" status</li>
                <li><strong>Noted →</strong> Moves to "Handling Concerns" section</li>
                <li>Student receives notification and can view your response</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Student Anonymity Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Why Anonymous?</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Protects students from potential bias or retaliation</li>
                <li>Encourages honest, constructive feedback</li>
                <li>Creates safe environment for raising concerns</li>
                <li>Maintains focus on the issue, not the person</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">What You See:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Concern title and description</li>
                <li>Category and branch information</li>
                <li>Program (e.g., Django, MERN) if relevant</li>
                <li>"Anonymous" label - no student name or ID</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                No Rating System for Trainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                <strong className="text-foreground">Key Policy:</strong> Unlike staff members, trainers do NOT rate students or concerns. You only provide text-based responses and explanations.
              </p>

              <p className="mt-4"><strong className="text-foreground">Why No Ratings?</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Avoids conflict of interest - you're being evaluated, not the student</li>
                <li>Prevents retaliatory rating behaviors</li>
                <li>Keeps focus on constructive dialogue and improvement</li>
                <li>Students receive your response without fear of negative consequences</li>
                <li>Maintains trust in the feedback system</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">What You Provide:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Text Response Only:</strong> Thoughtful explanation addressing the concern</li>
                <li><strong>No Stars or Thumbs:</strong> No positive/negative/neutral rating buttons</li>
                <li><strong>Automatic Neutral Record:</strong> System records your reply as neutral (0) for tracking</li>
                <li><strong>Focus on Content:</strong> Quality of your response matters, not a score</li>
              </ul>
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
                <li><strong>+20 Credits:</strong> When a student gives you positive feedback</li>
                <li>Credits reflect quality of your training and responsiveness</li>
                <li>High credits demonstrate teaching excellence</li>
                <li>Visible in your profile</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">What Credits Mean:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recognition of quality teaching</li>
                <li>Indicator of student satisfaction</li>
                <li>May contribute to performance evaluations</li>
                <li>Reflects positive student relationships</li>
              </ul>
              <p className="mt-4 bg-primary/10 p-3 rounded-lg">
                <strong className="text-foreground">Important:</strong> You do NOT rate students or provide ratings when responding to concerns. You only provide text responses explaining your perspective. Your reply is recorded as a neutral acknowledgment without scoring.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Exclusive Handler Role (Special Assignment)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Some trainers are designated as <strong className="text-yellow-500">Exclusive Handlers ⭐</strong> to manage concerns from Exclusive Members.</p>
              
              <p className="mt-4"><strong className="text-foreground">Exclusive Handler Responsibilities:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Handle ANY category of concern from Exclusive Members (not just trainer-related)</li>
                <li>View "All Exclusive Concerns" and "Assigned to Me" tabs</li>
                <li>Can assign concerns to themselves</li>
                <li>Update concern status through workflow stages</li>
                <li>Provide specialized, high-touch support</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Working on Concerns:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click "Working on Concern" to assign yourself and change status to In Process</li>
                <li>Investigate and take appropriate action</li>
                <li>Mark as Fixed when resolved</li>
                <li>Provide feedback via review system</li>
              </ul>

              <p className="mt-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <strong className="text-yellow-600">Special Status:</strong> Exclusive Handlers have elevated privileges and responsibilities. This role requires exceptional customer service skills and discretion.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Best Practices for Trainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Respond within 24-48 hours when possible</li>
                <li>✅ Acknowledge the concern even if you disagree</li>
                <li>✅ Explain your teaching methodology clearly</li>
                <li>✅ Show empathy and understanding</li>
                <li>✅ Offer solutions or alternatives when appropriate</li>
                <li>✅ Use concerns as opportunities for self-reflection</li>
                <li>✅ Maintain professional tone in all responses</li>
                <li>✅ Seek admin support for complex situations</li>
                <li>❌ Don't take concerns personally</li>
                <li>❌ Don't try to identify the student</li>
                <li>❌ Don't respond defensively or dismissively</li>
                <li>❌ Don't ignore concerns hoping they'll go away</li>
                <li>❌ Don't discuss individual concerns publicly</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
