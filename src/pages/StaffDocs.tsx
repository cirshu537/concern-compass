import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Award, AlertTriangle, MessageSquare, Users, ClipboardCheck, TrendingUp } from 'lucide-react';

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
          <p className="text-muted-foreground">Complete guide to managing and resolving student concerns</p>
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
              <p>As a staff member, you are the frontline responders for student concerns:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process concerns in your assigned branch</li>
                <li>Evaluate concern validity and take appropriate action</li>
                <li>Update status through workflow stages</li>
                <li>Communicate resolution to students</li>
                <li>Collaborate with branch admins and other staff</li>
                <li>Maintain response time standards</li>
              </ul>
              <p className="mt-4 bg-primary/10 p-3 rounded-lg">
                <strong className="text-foreground">Core Responsibility:</strong> Ensure timely, fair, and effective resolution of all assigned concerns while maintaining institutional standards.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Concern Processing Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Complete Workflow:</strong></p>
              
              <div className="space-y-4 mt-4">
                <div className="border-l-4 border-status-logged pl-4">
                  <p className="font-semibold text-status-logged">1. LOGGED (Initial State)</p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Concern submitted by student</li>
                    <li>Waiting for staff assignment</li>
                    <li>Branch admin may assign specific staff member</li>
                  </ul>
                </div>

                <div className="border-l-4 border-status-in-process pl-4">
                  <p className="font-semibold text-status-in-process">2. IN PROCESS (You're Working On It)</p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Click "Process Concern" button to claim and start working</li>
                    <li>Investigate the issue thoroughly</li>
                    <li>Gather information if needed</li>
                    <li>Take corrective action</li>
                    <li>Document your actions</li>
                  </ul>
                </div>

                <div className="border-l-4 border-status-fixed pl-4">
                  <p className="font-semibold text-status-fixed">3. FIXED (Successful Resolution)</p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Click "Mark as Fixed" when issue is resolved</li>
                    <li>Provide feedback explaining resolution</li>
                    <li>Rate the student's concern (Positive/Neutral/Negative)</li>
                    <li>Student can then rate your work</li>
                    <li>Credits awarded for positive outcomes</li>
                  </ul>
                </div>

                <div className="border-l-4 border-status-cancelled pl-4">
                  <p className="font-semibold text-status-cancelled">4. CANCELLED (Invalid Concern)</p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Use for duplicate, false, or misleading concerns</li>
                    <li>Provide explanation for cancellation</li>
                    <li>Rate negatively if concern was careless</li>
                    <li>Student receives negative event</li>
                    <li><strong className="text-destructive">Use carefully</strong> - impacts student record</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Rating Student Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">When You Provide Resolution:</strong></p>
              <p>After marking a concern as Fixed or Cancelled, you rate the quality of the concern itself:</p>

              <div className="space-y-3 mt-4">
                <div className="bg-status-fixed/10 p-3 rounded-lg border border-status-fixed/20">
                  <p className="font-semibold text-status-fixed">👍 Positive Rating</p>
                  <p className="text-sm mt-1">Use when:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Legitimate, well-documented concern</li>
                    <li>Clear description with evidence</li>
                    <li>Appropriate category selection</li>
                    <li>Constructive attitude from student</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Result:</strong> Both you and student get +20 credits</p>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <p className="font-semibold text-foreground">— Neutral Rating</p>
                  <p className="text-sm mt-1">Use when:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Valid but minor issue</li>
                    <li>Partial resolution achieved</li>
                    <li>Acceptable but not ideal concern quality</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Result:</strong> No credits, no negative events</p>
                </div>

                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <p className="font-semibold text-destructive">👎 Negative Rating</p>
                  <p className="text-sm mt-1">Use when:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>False or deliberately misleading information</li>
                    <li>Duplicate of existing concern</li>
                    <li>Frivolous or trivial complaint</li>
                    <li>Inappropriate use of system</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Result:</strong> Student gets negative event (3 = ban)</p>
                  <p className="text-sm font-semibold text-destructive mt-1">⚠️ Use sparingly and document reasoning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Credit System for Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Earning Credits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>+20 Credits:</strong> When you rate a student concern positively (both get credits)</li>
                <li><strong>+20 Credits:</strong> When a student rates your resolution work positively</li>
                <li>Credits reflect quality of service and student satisfaction</li>
                <li>Visible in your profile</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Credit Benefits:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recognition of excellent service</li>
                <li>Performance metric for evaluations</li>
                <li>Indicator of student satisfaction</li>
                <li>May unlock rewards or bonuses</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                High Alert System - Performance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">What is High Alert?</strong></p>
              <p>If you receive <strong className="text-destructive">3 or more negative reviews from students within 7 days</strong>, you will be placed on High Alert status.</p>

              <p className="mt-4"><strong className="text-foreground">Triggering Events:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Students rate your resolution work negatively (👎)</li>
                <li>Multiple concerns marked as poorly handled</li>
                <li>Pattern of student dissatisfaction</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">What Happens:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Immediate notification to you</li>
                <li>"High Alert" flag on your profile</li>
                <li><strong className="text-destructive">You must report to your branch admin</strong></li>
                <li>Admin reviews your cases</li>
                <li>Support and coaching provided</li>
                <li>Visible to branch and main admins</li>
              </ul>

              <p className="mt-4 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <strong className="text-destructive">This is NOT Punitive:</strong> High Alert is an early intervention system designed to:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Identify performance issues before they escalate</li>
                  <li>Provide support and resources</li>
                  <li>Improve service quality</li>
                  <li>Protect staff from burnout</li>
                </ul>
              </p>

              <p className="mt-4"><strong className="text-foreground">Prevention Strategies:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Respond to concerns within 24-48 hours</li>
                <li>Communicate clearly with students</li>
                <li>Document all actions taken</li>
                <li>Seek admin guidance for complex cases</li>
                <li>Follow up to ensure resolution</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Working with Assigned Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Dashboard Views:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>All Concerns:</strong> View all concerns in your branch</li>
                <li><strong>Assigned to Me:</strong> Concerns specifically assigned to you by branch admin</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Assignment Process:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Branch admin assigns concerns based on expertise or workload</li>
                <li>You can also proactively claim unassigned concerns</li>
                <li>Once assigned, you're responsible for resolution</li>
                <li>Update status to "In Process" when you start working</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Collaboration:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Branch admin can start group conversations with all staff</li>
                <li>Use conversations for complex cases needing discussion</li>
                <li>Escalate to admin when necessary</li>
                <li>Share knowledge and best practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Best Practices for Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Response Time & Quality:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Aim for 24-48 hour response time</li>
                <li>✅ Acknowledge receipt even if investigating</li>
                <li>✅ Set realistic expectations with students</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Investigation:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Gather all relevant information</li>
                <li>✅ Verify claims when possible</li>
                <li>✅ Consult with relevant departments</li>
                <li>✅ Document everything</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Communication:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Be clear, professional, and empathetic</li>
                <li>✅ Explain actions taken and why</li>
                <li>✅ Follow up to ensure satisfaction</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Rating & Feedback:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Be fair and objective in ratings</li>
                <li>✅ Document reasoning for negative ratings</li>
                <li>✅ Use cancellation sparingly</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Avoid:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>❌ Marking concerns as fixed without action</li>
                <li>❌ Cancelling valid concerns to avoid work</li>
                <li>❌ Ignoring or delaying difficult cases</li>
                <li>❌ Rating negatively out of frustration</li>
                <li>❌ Disclosing student identity unnecessarily</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
