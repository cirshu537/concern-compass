import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Users, MessageSquare, Eye, TrendingUp, AlertTriangle, Star, Building } from 'lucide-react';

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

  const isMainAdmin = profile?.role === 'main_admin';

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
            {isMainAdmin ? 'Main Admin' : 'Branch Admin'} Documentation
          </h1>
          <p className="text-muted-foreground">Complete guide to overseeing and managing the concern system</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Administrative Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{isMainAdmin ? 'Main Admin' : 'Branch Admin'} Core Duties:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Oversee all concerns in your {isMainAdmin ? 'organization' : 'branch'}</li>
                <li>Assign staff members to handle specific concerns</li>
                <li>Monitor staff and trainer performance metrics</li>
                <li>Manage conversations between team members</li>
                <li>Track resolution times and satisfaction rates</li>
                <li>Address high alert situations promptly</li>
                {isMainAdmin && <li className="font-semibold text-primary">Reveal anonymous student identities when absolutely necessary</li>}
                {isMainAdmin && <li className="font-semibold text-primary">Manage exclusive handlers and exclusive member concerns</li>}
              </ul>

              {isMainAdmin ? (
                <p className="mt-4 bg-primary/10 p-3 rounded-lg">
                  <strong className="text-foreground">Main Admin Authority:</strong> As the highest level administrator, you have system-wide oversight and can intervene in any concern, manage all branches, and make critical decisions about identity revelation.
                </p>
              ) : (
                <p className="mt-4 bg-primary/10 p-3 rounded-lg">
                  <strong className="text-foreground">Branch Admin Scope:</strong> Your authority covers all concerns and staff within your assigned branch. You work closely with Main Admin for cross-branch issues and report branch performance.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Staff Assignment & Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Assignment Process:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>View logged concerns in your {isMainAdmin ? 'system' : 'branch'}</li>
                <li>Review concern details and category</li>
                <li>Select appropriate staff member from dropdown</li>
                <li>Click "Assign" to assign the concern</li>
                <li>Staff member receives notification</li>
                <li>Track progress through status updates</li>
              </ol>

              <p className="mt-4"><strong className="text-foreground">Assignment Best Practices:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Match staff expertise to concern category</li>
                <li>Balance workload across team members</li>
                <li>Consider staff performance metrics</li>
                <li>Prioritize urgent or high-priority concerns</li>
                <li>Reassign if staff member is overwhelmed</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Monitoring Staff Performance:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>View staff credits and ratings</li>
                <li>Track resolution times</li>
                <li>Monitor negative review patterns</li>
                <li>Identify high-performing staff</li>
                <li>Support struggling team members</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                High Alert Management - Critical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">What Triggers High Alert?</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Staff/Trainers:</strong> 3+ negative reviews within 7 days</li>
                <li>System automatically flags the account</li>
                <li>User receives notification to report to admin</li>
                <li>High alert status visible on dashboard</li>
              </ul>

              <p className="mt-4"><strong className="text-foreground">Your Response Actions:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong className="text-destructive">Immediate Review:</strong> Check high alert notifications</li>
                <li><strong>Case Investigation:</strong> Review the concerns that led to negative reviews</li>
                <li><strong>Staff Meeting:</strong> Schedule 1-on-1 discussion with affected person</li>
                <li><strong>Root Cause Analysis:</strong> Identify underlying issues:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Communication problems?</li>
                    <li>Workload too high?</li>
                    <li>Training gaps?</li>
                    <li>Systemic issues?</li>
                  </ul>
                </li>
                <li><strong>Action Plan:</strong> Create improvement plan with specific goals</li>
                <li><strong>Follow-up:</strong> Monitor progress and provide ongoing support</li>
              </ol>

              <p className="mt-4 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <strong className="text-destructive">Key Principle:</strong> High Alert is a support mechanism, not punishment. Focus on:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Understanding the situation</li>
                  <li>Providing resources and training</li>
                  <li>Addressing workload or system issues</li>
                  <li>Preventing future problems</li>
                </ul>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Conversation Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Available Conversation Types:</strong></p>

              {isMainAdmin && (
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 mb-3">
                  <p className="font-semibold text-primary">Main Admin → Branch Admin</p>
                  <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                    <li>Discuss specific concerns affecting a branch</li>
                    <li>Coordinate cross-branch issues</li>
                    <li>Request information or action from branch admin</li>
                    <li>Click "Start Conversation with Branch Admin" on concern details</li>
                  </ul>
                </div>
              )}

              <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                <p className="font-semibold text-secondary">Branch Admin → Staff Team</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                  <li>Start group conversations with all staff in branch</li>
                  <li>Discuss complex cases needing team input</li>
                  <li>Share updates or policy changes</li>
                  <li>Coordinate responses to major issues</li>
                  <li>Click "Start Group Conversation with Staff"</li>
                </ul>
              </div>

              <p className="mt-4"><strong className="text-foreground">Best Practices:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use conversations for complex or sensitive matters</li>
                <li>Keep discussions focused on the specific concern</li>
                <li>Document important decisions</li>
                <li>Close conversations when resolved</li>
                <li>Maintain professional communication</li>
              </ul>
            </CardContent>
          </Card>

          {isMainAdmin && (
            <Card className="bg-card border-border border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Eye className="w-5 h-5" />
                  Identity Revelation - Extreme Caution Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p className="bg-destructive/20 p-3 rounded-lg border border-destructive/40 font-semibold text-destructive">
                  ⚠️ CRITICAL: Identity revelation should be used ONLY in exceptional circumstances. This action is irreversible and logged for accountability.
                </p>

                <p className="mt-4"><strong className="text-foreground">When to Reveal Identity:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Safety Emergency:</strong> Immediate threat to student or others</li>
                  <li><strong>Legal Requirement:</strong> Court order or law enforcement request</li>
                  <li><strong>Disciplinary Action:</strong> Serious policy violation requiring formal action</li>
                  <li><strong>Unable to Resolve:</strong> Issue cannot be addressed without identity (rare)</li>
                </ul>

                <p className="mt-4"><strong className="text-foreground">Reveal Identity Process:</strong></p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Open anonymous concern details</li>
                  <li>Click "Reveal Student Identity" button</li>
                  <li>Confirm action in dialog (no undo)</li>
                  <li>Student identity becomes visible to all assigned staff</li>
                  <li>Action is permanently logged in system</li>
                  <li>Document reason in case notes</li>
                </ol>

                <p className="mt-4 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <strong className="text-destructive">Important Considerations:</strong>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Consult with legal/HR if unsure</li>
                    <li>Consider less invasive alternatives first</li>
                    <li>Document justification thoroughly</li>
                    <li>Inform student when appropriate</li>
                    <li>Be prepared to explain decision if questioned</li>
                  </ul>
                </p>
              </CardContent>
            </Card>
          )}

          {isMainAdmin && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Exclusive Handler System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">What are Exclusive Handlers?</strong></p>
                <p>Exclusive Handlers are specially designated trainers who provide premium support to Exclusive Members (paid program students).</p>

                <p className="mt-4"><strong className="text-foreground">Handler Capabilities:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>View all concerns from Exclusive Members (all categories)</li>
                  <li>Assign concerns to themselves</li>
                  <li>Process concerns through full workflow</li>
                  <li>Provide ratings and feedback</li>
                  <li>See separate dashboard with exclusive stats</li>
                </ul>

                <p className="mt-4"><strong className="text-foreground">Managing Exclusive Handlers:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Designate trainers via profile settings (handles_exclusive flag)</li>
                  <li>Monitor their performance separately</li>
                  <li>Ensure adequate coverage for exclusive members</li>
                  <li>Review exclusive member satisfaction</li>
                  <li>Provide additional training if needed</li>
                </ul>

                <p className="mt-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  <strong className="text-yellow-600">Special Note:</strong> Exclusive Handlers represent your premium service tier. Select experienced trainers with excellent communication skills and high performance records.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Key Metrics to Monitor:</strong></p>

              <div className="space-y-3 mt-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Concern Volume</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Total concerns by time period</li>
                    <li>Concerns by category</li>
                    <li>Trends over time (increasing/decreasing)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-secondary pl-4">
                  <p className="font-semibold text-foreground">Resolution Metrics</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Average time to resolution</li>
                    <li>Percentage fixed vs. cancelled</li>
                    <li>Open concerns aging report</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <p className="font-semibold text-foreground">Satisfaction Scores</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Positive review percentage</li>
                    <li>Negative review trends</li>
                    <li>Staff/trainer ratings</li>
                  </ul>
                </div>

                <div className="border-l-4 border-destructive pl-4">
                  <p className="font-semibold text-foreground">Problem Areas</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>High alert incidents</li>
                    <li>Student ban rates</li>
                    <li>Recurring issue patterns</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4"><strong className="text-foreground">Using Data for Improvement:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Identify systemic issues requiring policy changes</li>
                <li>Allocate resources based on concern volume</li>
                <li>Recognize and reward high performers</li>
                <li>Provide targeted training where needed</li>
                <li>Track impact of improvement initiatives</li>
              </ul>
            </CardContent>
          </Card>

          {isMainAdmin && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Multi-Branch Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Cross-Branch Oversight:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>View statistics for all branches</li>
                  <li>Compare branch performance metrics</li>
                  <li>Identify branches needing support</li>
                  <li>Share best practices across branches</li>
                  <li>Coordinate consistent policies</li>
                </ul>

                <p className="mt-4"><strong className="text-foreground">Branch Admin Support:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide guidance to branch admins</li>
                  <li>Resolve inter-branch conflicts</li>
                  <li>Assist with complex cases</li>
                  <li>Share resources and training</li>
                  <li>Monitor for consistency</li>
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Administrative Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Leadership & Oversight:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Review dashboard daily for urgent issues</li>
                <li>✅ Address high alerts within 24 hours</li>
                <li>✅ Maintain open communication with team</li>
                <li>✅ Lead by example in professionalism</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Decision Making:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Be fair and consistent</li>
                <li>✅ Document important decisions</li>
                <li>✅ Consider multiple perspectives</li>
                <li>✅ Use data to inform choices</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Team Development:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Provide regular feedback</li>
                <li>✅ Recognize excellent performance</li>
                <li>✅ Support struggling team members</li>
                <li>✅ Invest in training and development</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">System Improvement:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Analyze trends and patterns</li>
                <li>✅ Seek feedback from staff and students</li>
                <li>✅ Propose policy improvements</li>
                <li>✅ Test and refine processes</li>
              </ul>

              <p className="font-semibold text-foreground mb-2 mt-4">Avoid:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>❌ Ignoring high alert situations</li>
                <li>❌ Revealing identity without strong justification</li>
                <li>❌ Micromanaging staff assignments</li>
                <li>❌ Making decisions without adequate information</li>
                <li>❌ Failing to document critical actions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
