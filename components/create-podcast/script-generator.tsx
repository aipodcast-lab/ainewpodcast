"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generatePodcastScript } from '@/lib/script-generator';

interface ScriptGeneratorProps {
  title: string;
  description: string;
  onScriptGenerated: (script: string) => void;
}

export default function ScriptGenerator({ title, description, onScriptGenerated }: ScriptGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (!title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a podcast title",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedScript = await generatePodcastScript(title, description);
      setScript(generatedScript);
      onScriptGenerated(generatedScript);
      toast({
        title: "Success",
        description: "Podcast script generated successfully!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate script';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Podcast Script</label>
        <Button
          variant="outline"
          onClick={handleGenerateScript}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Script
            </>
          )}
        </Button>
      </div>
      <Textarea
        value={script}
        onChange={(e) => {
          setScript(e.target.value);
          onScriptGenerated(e.target.value);
        }}
        placeholder="Click 'Generate Script' to create a podcast script, or write your own"
        className="min-h-[200px] font-mono"
      />
    </div>
  );
}