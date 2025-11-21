import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RegisterExclusiveHandler() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleRegister1 = async () => {
    setLoading1(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-exclusive-handler', {
        body: {
          email: 'exclusivehandler@gmail.com',
          password: 'exclusive123',
          fullName: 'Exclusive Handler 1'
        }
      });

      if (error) throw error;

      toast.success('Exclusive Handler 1 registered successfully!');
      console.log('Registration result:', data);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register exclusive handler 1');
    } finally {
      setLoading1(false);
    }
  };

  const handleRegister2 = async () => {
    setLoading2(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-exclusive-handler', {
        body: {
          email: 'exclusivehandler2@gmail.com',
          password: 'exclusive123',
          fullName: 'Exclusive Handler 2'
        }
      });

      if (error) throw error;

      toast.success('Exclusive Handler 2 registered successfully!');
      console.log('Registration result:', data);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register exclusive handler 2');
    } finally {
      setLoading2(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Register Exclusive Handler 1</CardTitle>
            <CardDescription>
              First exclusive handler account
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
                onClick={handleRegister1} 
                disabled={loading1}
                className="w-full"
              >
                {loading1 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Handler 1'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Register Exclusive Handler 2</CardTitle>
            <CardDescription>
              Second exclusive handler account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <p><strong>Email:</strong> exclusivehandler2@gmail.com</p>
                <p><strong>Password:</strong> exclusive123</p>
                <p><strong>Role:</strong> Exclusive Members Handler</p>
              </div>
              <Button 
                onClick={handleRegister2} 
                disabled={loading2}
                className="w-full"
              >
                {loading2 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Handler 2'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
