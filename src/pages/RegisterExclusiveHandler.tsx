import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RegisterExclusiveHandler() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-exclusive-handler', {
        body: {
          email: 'exclusivehandler@gmail.com',
          password: 'exclusive123',
          fullName: 'Exclusive Handler'
        }
      });

      if (error) throw error;

      toast.success('Exclusive handler registered successfully!');
      console.log('Registration result:', data);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register exclusive handler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register Exclusive Handler</CardTitle>
          <CardDescription>
            Click the button below to register the exclusive handler account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p><strong>Email:</strong> exclusivehandler@gmail.com</p>
              <p><strong>Password:</strong> exclusive123</p>
              <p><strong>Role:</strong> Exclusive Members Handler</p>
            </div>
            <Button 
              onClick={handleRegister} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Handler'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
