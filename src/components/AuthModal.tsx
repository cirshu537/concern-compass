import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppRole, StudentType } from '@/types/database';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<AppRole>('student');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentType, setStudentType] = useState<StudentType>('brocamp');
  const [branch, setBranch] = useState('');
  const [program, setProgram] = useState('');

  const handleLogin = async (loginRole: AppRole) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      toast.success('Logged in successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !branch) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: 'student',
            student_type: studentType,
            branch,
            program: program || null,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto my-4 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-cyber bg-clip-text text-transparent">
            {isLogin ? 'Login' : 'Register'}
          </DialogTitle>
        </DialogHeader>

        {isLogin ? (
          <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setRole(value as AppRole)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="trainer">Trainer</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="main_admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <Button
                onClick={() => handleLogin('student')}
                disabled={loading}
                className="w-full bg-gradient-cyber text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsLogin(false)}
                className="w-full"
              >
                Register as Student
              </Button>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>student1@gmail.com / student123</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trainer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email-trainer">Email</Label>
                <Input
                  id="email-trainer"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-trainer">Password</Label>
                <Input
                  id="password-trainer"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <Button
                onClick={() => handleLogin('trainer')}
                disabled={loading}
                className="w-full bg-gradient-cyber text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs">
                  <p className="text-primary font-medium">traineronline@gmail.com / trainer123 (Online)</p>
                  <p className="text-muted-foreground">trainer1kochi@gmail.com / trainer123</p>
                  <p className="text-muted-foreground">trainer1calicut@gmail.com / trainer123</p>
                  <p className="text-muted-foreground">trainer1tvm@gmail.com / trainer123</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email-staff">Email</Label>
                <Input
                  id="email-staff"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-staff">Password</Label>
                <Input
                  id="password-staff"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <Button
                onClick={() => handleLogin('staff')}
                disabled={loading}
                className="w-full bg-gradient-cyber text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>staff1kochi@gmail.com / staff123</p>
                  <p>staff1calicut@gmail.com / staff123</p>
                  <p>staff1tvm@gmail.com / staff123</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="main_admin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email-admin">Email</Label>
                <Input
                  id="email-admin"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-admin">Password</Label>
                <Input
                  id="password-admin"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <Button
                onClick={() => handleLogin('main_admin')}
                disabled={loading}
                className="w-full bg-gradient-cyber text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs">
                  <p className="text-primary font-medium">adminmain@gmail.com / admin123</p>
                  <p className="text-muted-foreground">adminkochi@gmail.com / admin123</p>
                  <p className="text-muted-foreground">admincalicut@gmail.com / admin123</p>
                  <p className="text-muted-foreground">admintvm@gmail.com / admin123</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="register-name" className="text-sm">Full Name *</Label>
              <Input
                id="register-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-input border-border h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="register-email" className="text-sm">Email *</Label>
              <Input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="bg-input border-border h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="register-password" className="text-sm">Password *</Label>
              <Input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="bg-input border-border h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="student-type" className="text-sm">Student Type *</Label>
              <Select value={studentType} onValueChange={(value) => setStudentType(value as StudentType)}>
                <SelectTrigger className="bg-input border-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brocamp">BroCamp Student</SelectItem>
                  <SelectItem value="exclusive">Exclusive Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="branch" className="text-sm">Branch *</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="bg-input border-border h-9">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kochi">Kochi</SelectItem>
                  <SelectItem value="Calicut - Kakkanchery">Calicut - Kakkanchery</SelectItem>
                  <SelectItem value="Trivandrum">Trivandrum</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {studentType === 'brocamp' && (
              <div className="space-y-1">
                <Label htmlFor="program" className="text-sm">Program</Label>
                <Input
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g., Full Stack Development"
                  className="bg-input border-border h-9"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsLogin(true)}
                className="flex-1 h-9"
              >
                Back to Login
              </Button>
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 h-9 bg-gradient-cyber text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Creating...' : 'Register'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};