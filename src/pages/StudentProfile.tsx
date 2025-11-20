import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Award, AlertCircle, User, MapPin, BookOpen } from 'lucide-react';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => {
            if (profile?.role === 'staff') navigate('/staff/dashboard');
            else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
            else navigate('/student/dashboard');
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">Your account information and statistics</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                <div className="text-lg font-semibold">{profile?.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-lg">{profile?.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Student Type</div>
                <div className="text-lg font-semibold capitalize">
                  {profile?.student_type === 'brocamp' ? 'BroCamp Student' : 'Exclusive Member'}
                </div>
              </div>
              {profile?.student_type === 'brocamp' && profile?.branch && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Branch</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold">{profile.branch}</span>
                  </div>
                </div>
              )}
              {profile?.program && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg">{profile.program}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Total Credits
                </CardTitle>
                <CardDescription>Earned through positive behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{profile?.credits || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Negative Events
                </CardTitle>
                <CardDescription>Lifetime count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-destructive">{profile?.negative_count_lifetime || 0}</div>
                {(profile?.negative_count_lifetime || 0) >= 2 && (
                  <p className="text-sm text-destructive/80 mt-2">
                    Warning: Close to ban threshold (3 negatives)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Status */}
          {profile?.banned_from_raise && (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Account Restriction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive/90">
                  Your account has been restricted from raising new concerns due to repeated negative events. 
                  This happens when you accumulate 3 or more negative events. Please contact administration 
                  for assistance in resolving this restriction.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}