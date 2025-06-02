'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

const categories = [
  'YouTube',
  'Instagram',
  'TikTok',
  'General',
];

export default function SubmitTrendPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()) || [];
      formData.set('tags', JSON.stringify(tags));

      const response = await fetch('/api/trends', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your trend has been submitted successfully.',
          variant: 'default'
        });
        router.push('/trends');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit trend. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/trends" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trends
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a New Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Trend Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., 'I Tried X for Y Days'"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Explain the trend pattern and why it works..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Screenshot (Optional)</Label>
              <div className="mt-1 flex items-center gap-4">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {previewUrl && (
                  <div className="relative h-20 w-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Trend'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 