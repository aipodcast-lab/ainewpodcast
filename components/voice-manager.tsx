'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Upload, Play, Pause, AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { cloneVoice } from '@/lib/services/elevenlabs/voice-clone';
import { textToSpeech } from '@/lib/services/elevenlabs/text-to-speech';
import { useAudioRecorder } from '@/lib/services/audio/recorder';

export default function VoiceManager() {
  const { toast } = useToast();
  const {
    isRecording,
    audioBlob,
    audioUrl,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    console.log(`Uploading file: ${file}`);

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.log('File size:', file.size, 'bytes');
        setError('File size must be less than 10MB');
        return;
      }

      console.log('File name:', file);
      setUploadedFile(file);
      setError(null);
      // Reset any recorded audio when uploading
      resetRecording();
    }
  };

  const handleCreateVoiceClone = async () => {
    if (!voiceName || voiceName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a voice name',
      });
      return;
    }

    console.log('Voice', voiceName);

    if (!audioBlob && !uploadedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please record or upload an audio sample',
      });
      return;
    }

    console.log({
      audioBlob,
      uploadedFile,
    });

    setIsProcessing(true);
    setError(null);

    try {
      console.log('aaaaaaaaa');

      const audioFile = audioBlob
        ? new File([audioBlob], 'recording.wav', { type: 'audio/wav' })
        : uploadedFile;

      if (!audioFile) {
        throw new Error('No audio file available');
      }

      console.log('bbbbbb');

      console.log({
        voiceName,
        audioFile,
      });

      console.log('ccccccccc');

      const result = await cloneVoice(voiceName, audioFile);

      console.log('dddddddddddd', result);

      toast({
        title: 'Success',
        description: 'Voice clone created successfully!',
      });

      // Store voice ID for later use
      localStorage.setItem('lastVoiceId', result.voice_id);
      localStorage.setItem('lastVoiceName', voiceName);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clone voice';

      console.log({
        err,
      });

      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Voice Cloning Studio</h2>
        <p className="text-muted-foreground">
          Create your custom AI voice clone
        </p>
      </div>

      {(error || recordingError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || recordingError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label>Voice Name</Label>
          <Input
            placeholder="Enter a name for your voice clone"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label>Record Voice Sample</Label>
          <div className="flex gap-4">
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              className="flex-1"
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            {audioUrl && (
              <Button
                variant="outline"
                onClick={resetRecording}
                className="px-3"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="- my-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label>Upload Voice Sample</Label>
          <div className="flex gap-4">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="voice-upload"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('voice-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio File
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: 10MB. Supported formats: MP3, WAV
          </p>
        </div>

        {(audioUrl || uploadedFile) && (
          <div className="space-y-4">
            <Label>Preview Voice Sample</Label>
            <audio
              controls
              src={
                audioUrl ||
                (uploadedFile ? URL.createObjectURL(uploadedFile) : undefined)
              }
              className="w-full"
            />
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleCreateVoiceClone}
          disabled={(!audioBlob && !uploadedFile) || !voiceName || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Create Voice Clone'}
        </Button>
      </div>
    </Card>
  );
}
