import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip, X } from 'lucide-react';
import { ComplaintCategory } from '@/types/database';

export default function StudentRaise() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [anonymous, setAnonymous] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const brocampCategories: ComplaintCategory[] = [
    'facility_campus',
    'trainer_related',
    'personal_institute',
    'safety_wellbeing',
  ];

  const exclusiveCategories: ComplaintCategory[] = [
    'content_quality',
    'platform_issue',
    'payment_membership',
    'support_communication',
  ];

  const categories = profile?.student_type === 'brocamp' ? brocampCategories : exclusiveCategories;

  const getCategoryLabel = (cat: ComplaintCategory) => {
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      toast.error('Please fill all required fields');
      return;
    }

    if (profile?.banned_from_raise) {
      toast.error('You are currently restricted from raising concerns');
      return;
    }

    setLoading(true);
    try {
      let attachmentUrl = null;

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile!.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        attachmentUrl = fileName;
      }

      const { error } = await supabase.from('complaints').insert({
        title,
        description,
        category,
        student_id: profile!.id,
        student_type: profile!.student_type,
        branch: profile!.branch || 'Online',
        program: profile!.program,
        anonymous,
        attachment_url: attachmentUrl,
      });

      if (error) throw error;

      toast.success('Concern submitted successfully');
      navigate('/student/status');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit concern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl overflow-y-auto">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-cyber bg-clip-text text-transparent">
              Raise a Concern
            </CardTitle>
            <CardDescription>
              Share your concerns with us. {anonymous ? 'Your identity will remain anonymous.' : 'Your identity will be visible to staff.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ComplaintCategory)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your concern"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about your concern..."
                className="bg-input border-border min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <div className="space-y-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-xs max-h-48 rounded border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      id="attachment"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('attachment')?.click()}
                      className="w-full"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                Submit anonymously (your identity will not be revealed to staff)
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-cyber text-background hover:opacity-90"
              >
                {loading ? 'Submitting...' : 'Submit Concern'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}