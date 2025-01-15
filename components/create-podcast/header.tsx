"use client"

import { Mic2 } from "lucide-react";

export default function PodcastHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Mic2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Create a Podcast</h1>
        <p className="text-muted-foreground">Generate AI-powered podcasts from your content</p>
      </div>
    </div>
  );
}