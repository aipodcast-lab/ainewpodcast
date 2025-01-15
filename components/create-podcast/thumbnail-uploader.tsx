"use client"

import { Button } from "@/components/ui/button";

export default function ThumbnailUploader() {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Podcast Thumbnail</label>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          AI prompt to generate thumbnail
        </Button>
        <Button variant="outline" className="flex-1">
          Upload custom image
        </Button>
      </div>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          SVG, PNG, JPG or GIF (max. 1080x1080px)
        </p>
      </div>
    </div>
  );
}