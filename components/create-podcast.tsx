"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, Globe, Trash } from "lucide-react";
import VoiceManager from "@/components/voice-manager";
import ScriptGenerator from "@/components/script-generator";
import { use, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createPodcastAudio } from "@/lib/script-generator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { config } from "@/lib/config";
import ThumbnailUploader from './create-podcast/thumbnail-uploader';
import { savePodcastData } from '@/lib/services/firebase/podcast';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function CreatePodcast() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("short");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMultiSpeaker, setUseMultiSpeaker] = useState(false);
  const [useAwsVoice, setUseAwsVoice] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const { user } = useAuth();

  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [clonedVoiceName, setClonedVoiceName] = useState<string | null>(null);

  const [speakers, setSpeakers] = useState([
    { id: "host", name: "Host", voice: "en-US-Neural2-D" },
    { id: "guest", name: "Guest", voice: "en-US-Neural2-D" },
  ]);
  const [selectedSpeakers, setSelectedSpeakers] = useState<
    { name: string; voice: string; gender: "male" | "female" }[]
  >([]);

  useEffect(() => {
    const storedVoiceId = localStorage.getItem("lastVoiceId");
    const storedVoiceName = localStorage.getItem("lastVoiceName");

    if (storedVoiceId && storedVoiceName) {
      setClonedVoiceId(storedVoiceId);
      setClonedVoiceName(storedVoiceName);
    }
  }, []);

  const handleDefaultVoiceSelection = () => {
    const voiceToUse = clonedVoiceId || "en-US-Neural2-D";
    setSelectedSpeakers([
      { name: "Default Speaker", voice: voiceToUse, gender: "male" },
    ]);
  };

  const addSelectedSpeaker = () => {
    setSelectedSpeakers([
      ...selectedSpeakers,
      { name: "", voice: "", gender: "male" },
    ]);
  };

  const removeSelectedSpeaker = (index: number) => {
    setSelectedSpeakers(selectedSpeakers.filter((_, i) => i !== index));
  };

  const updateSelectedSpeaker = (index: number, key: string, value: string) => {
    setSelectedSpeakers(
      selectedSpeakers.map((speaker, i) =>
        i === index ? { ...speaker, [key]: value } : speaker
      )
    );
  };

  const validateOptions = () => {
    if (!title) {
      throw new Error("Please enter a podcast title");
    }

    if (useMultiSpeaker && selectedSpeakers.length === 0) {
      throw new Error("Please add at least one speaker");
    }

    if (useMultiSpeaker) {
      for (let index = 0; index < selectedSpeakers.length; index++) {
        const speaker = selectedSpeakers[index];
        if (!speaker.name || speaker.name === "") {
          throw new Error(`Please enter a name for speaker ${index + 1}`);
        }

        if (!speaker.voice || speaker.voice === "") {
          throw new Error(`Please select a voice for speaker ${index + 1}`);
        }
      }
    }
  };

  const handleGeneratePodcast = async () => {
    if (!script) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please generate or write a script first"
      });
      return;
    }

    if (!config.google.clientEmail || !config.google.privateKey) {
      setError("Google Cloud credentials not found in environment variables");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const audioUrl = await createPodcastAudio(
        {
          script,
          speakers: useMultiSpeaker ? selectedSpeakers : undefined,
          useAwsVoice,
        },
        clonedVoiceId || "en-US-Neural2-D"
      );

      // Save podcast data to Firebase
      if (user?.email) {
        await savePodcastData({
          title,
          description,
          script,
          thumbnailUrl: thumbnailUrl || undefined,
          audioUrl,
          userEmail: user.email
        });
      }

      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Podcast generated and downloaded successfully!"
      });

      // Reset form after successful generation
      setTitle("");
      setDescription("");
      setScript("");
      setThumbnailUrl(null);
      setStep(1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate podcast";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Podcast</h1>
        <p className="text-muted-foreground">
          Generate AI-powered podcasts from your content
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {step === 1 && <VoiceManager />}

        {step === 2 && (
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Podcast title
              </label>
              <Input
                placeholder="The Sample Podcast"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="Write a short description about the podcast"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Podcast duration
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (2-5 minutes)</SelectItem>
                  <SelectItem value="medium">Medium (5-10 minutes)</SelectItem>
                  <SelectItem value="long">Long (10-15 minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select voices(select manually or use cloned)
                <Button
                  onClick={() => setUseAwsVoice(!useAwsVoice)}
                  variant="outline"
                  className={`flex-1 ${useAwsVoice ? "selected" : ""}`}
                >
                  {(useAwsVoice
                    ? "Using AWS Polly voices"
                    : "Using Google voices") + ", click to change"}
                </Button>
              </label>
              <div className="flex gap-4">
                <Button
                  onClick={() => setUseMultiSpeaker(true)}
                  variant="outline"
                  className={`flex-1 ${useMultiSpeaker ? "selected" : ""}`}
                >
                  Select manually
                </Button>
                <Button
                  onClick={() => {
                    setUseMultiSpeaker(false);
                    handleDefaultVoiceSelection();
                  }}
                  variant="outline"
                  className={`flex-1 ${!useMultiSpeaker ? "selected" : ""}`}
                >
                  Use cloned voice
                </Button>
              </div>
            </div>

            {useMultiSpeaker && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select speakers
                </label>
                <div className="space-y-4">
                  {selectedSpeakers.map((speaker, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        className="flex-1 max-w-[180px]"
                        placeholder="Speaker name"
                        value={speaker.name}
                        onChange={(e) =>
                          updateSelectedSpeaker(index, "name", e.target.value)
                        }
                      />
                      <Select
                        value={speaker.voice}
                        onValueChange={(value) =>
                          updateSelectedSpeaker(index, "voice", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        {useAwsVoice ? (
                          <SelectContent>
                            <SelectItem value="Joanna">
                              Joanna( English Female)
                            </SelectItem>
                            <SelectItem value="Matthew">
                              Matthew ( English Male)
                            </SelectItem>
                            <SelectItem value="Danielle">
                              Danielle( English Female)
                            </SelectItem>
                            <SelectItem value="Stephen">
                              Stephen ( English Male)
                            </SelectItem>
                            <SelectItem value="Ruth">
                              Ruth( English Female)
                            </SelectItem>
                            {clonedVoiceId && (
                              <SelectItem value="elevenlab">
                                {clonedVoiceName}
                              </SelectItem>
                            )}
                          </SelectContent>
                        ) : (
                          <SelectContent>
                            <SelectItem value="en-US-Studio-Q">
                              en-US-Studio-Q( English Male)
                            </SelectItem>
                            <SelectItem value="en-US-Studio-O">
                              en-US-Studio-O ( English Female)
                            </SelectItem>
                            <SelectItem value="en-GB-Studio-B">
                              en-GB-Studio-B (English UK Male)
                            </SelectItem>
                            <SelectItem value="en-GB-Studio-C">
                              en-GB-Studio-C (English UK Female)
                            </SelectItem>
                          </SelectContent>
                        )}
                      </Select>

                      <Select
                        value={speaker.gender}
                        onValueChange={(value) =>
                          updateSelectedSpeaker(index, "gender", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="destructive"
                        onClick={() => removeSelectedSpeaker(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addSelectedSpeaker}>Add speaker</Button>
                </div>
              </div>
            )}

            <ScriptGenerator
              title={title}
              description={description}
              speakers={useMultiSpeaker ? selectedSpeakers : undefined}
              duration={duration}
              onScriptGenerated={setScript}
              beforeGenerate={() => validateOptions()}
            />

            <ThumbnailUploader 
              title={title} 
              onThumbnailGenerated={setThumbnailUrl}
            />
          </Card>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < 2 && (
            <Button className="ml-auto" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button
              className="ml-auto"
              onClick={handleGeneratePodcast}
              disabled={isGenerating || !script}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Podcast"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}