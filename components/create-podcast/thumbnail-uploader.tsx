"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { generateThumbnail } from "@/lib/services/dalle/image";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ThumbnailUploaderProps {
  title: string;
}

export default function ThumbnailUploader({ title }: ThumbnailUploaderProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a podcast title first"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const imageUrl = await generateThumbnail(title);
      setThumbnailUrl(imageUrl);
      toast({
        title: "Success",
        description: "Thumbnail generated successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Podcast Thumbnail</label>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleGenerateImage}
          disabled={isGenerating || !title}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'AI prompt to generate thumbnail'
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => document.getElementById('thumbnail-upload')?.click()}
        >
          Upload custom image
        </Button>
        <input
          id="thumbnail-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt="Podcast thumbnail" 
            className="max-w-full h-auto mx-auto rounded-lg"
            style={{ maxHeight: '300px' }}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              SVG, PNG, JPG or GIF (max. 1080x1080px)
            </p>
          </>
        )}
      </div>
    </div>
  );
}