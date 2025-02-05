"use client"

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import ScriptGenerator from "./script-generator";

interface PodcastFormProps {
  title: string;
  description: string;
  isGenerating: boolean;
  hasScript: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onScriptGenerated: (script: string) => void;
  onGenerate: () => void;
}

export default function PodcastForm({
  title,
  description,
  isGenerating,
  hasScript,
  onTitleChange,
  onDescriptionChange,
  onScriptGenerated,
  onGenerate,
}: PodcastFormProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Podcast title</label>
        <Input 
          placeholder="The Sample Podcast" 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea 
          placeholder="Write a short description about the podcast"
          className="min-h-[100px]"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <ScriptGenerator
        title={title}
        description={description}
        onScriptGenerated={onScriptGenerated}
      />

      <Button 
        className="w-full" 
        onClick={onGenerate}
        disabled={isGenerating || !hasScript}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Generate Podcast
          </>
        )}
      </Button>
    </Card>
  );
}