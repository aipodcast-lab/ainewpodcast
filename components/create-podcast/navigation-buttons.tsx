"use client"

import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface NavigationButtonsProps {
  step: number;
  isGenerating: boolean;
  hasScript: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGenerate: () => void;
}

export default function NavigationButtons({
  step,
  isGenerating,
  hasScript,
  onPrevious,
  onNext,
  onGenerate,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between">
      {step > 1 && (
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      )}
      {step < 2 && (
        <Button className="ml-auto" onClick={onNext}>
          Next
        </Button>
      )}
      {step === 2 && (
        <Button 
          className="ml-auto" 
          onClick={onGenerate}
          disabled={isGenerating || !hasScript}
        >
          <Mic className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Podcast'}
        </Button>
      )}
    </div>
  );
}