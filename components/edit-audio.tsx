'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

export default function EditAudio() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // File states
  const [introAudioFile, setIntroAudioFile] = useState<File | null>(null);
  const [mainAudioFile, setMainAudioFile] = useState<File | null>(null);
  const [outroAudioFile, setOutroAudioFile] = useState<File | null>(null);

  // Audio states
  const [introAudioUrl, setIntroAudioUrl] = useState<string | null>(null);
  const [mainAudioUrl, setMainAudioUrl] = useState<string | null>(null);
  const [outroAudioUrl, setOutroAudioUrl] = useState<string | null>(null);

  // Audio context ref
  const audioContextRef = useRef<AudioContext>();

  const handleFileUpload = async (file: File, type: 'intro' | 'main' | 'outro') => {
    try {
      const audioUrl = URL.createObjectURL(file);

      switch (type) {
        case 'intro':
          setIntroAudioFile(file);
          setIntroAudioUrl(audioUrl);
          break;
        case 'main':
          setMainAudioFile(file);
          setMainAudioUrl(audioUrl);
          break;
        case 'outro':
          setOutroAudioFile(file);
          setOutroAudioUrl(audioUrl);
          break;
      }

      setError(null);
    } catch (err) {
      console.error('Error loading audio file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audio file');
    }
  };

  const mergeAndDownload = async () => {
    try {
      setIsProcessing(true);
      
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const files = [introAudioFile, mainAudioFile, outroAudioFile].filter(Boolean) as File[];
      
      if (files.length === 0) {
        throw new Error('No audio files to merge');
      }

      // Load and decode all audio files
      const buffers = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return await audioContext.decodeAudioData(arrayBuffer);
        })
      );

      // Calculate total length
      const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
      
      // Create a new buffer for the merged audio
      const mergedBuffer = audioContext.createBuffer(
        buffers[0].numberOfChannels,
        totalLength,
        buffers[0].sampleRate
      );

      // Merge buffers
      let offset = 0;
      buffers.forEach((buffer) => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          mergedBuffer.copyToChannel(channelData, channel, offset);
        }
        offset += buffer.length;
      });

      // Convert to WAV format
      const wavData = audioBufferToWav(mergedBuffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-podcast.wav';
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Audio files merged successfully'
      });
    } catch (err) {
      console.error('Error merging audio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge audio files';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV format
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const outputBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(outputBuffer);
    const sampleRate = buffer.sampleRate;

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return outputBuffer;
  }

  // Helper function to write strings to DataView
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (introAudioUrl) URL.revokeObjectURL(introAudioUrl);
      if (mainAudioUrl) URL.revokeObjectURL(mainAudioUrl);
      if (outroAudioUrl) URL.revokeObjectURL(outroAudioUrl);
    };
  }, [introAudioUrl, mainAudioUrl, outroAudioUrl]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Audio</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Intro Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Intro</h2>
          {introAudioUrl && (
            <audio
              src={introAudioUrl}
              controls
              className="w-full mb-4"
            />
          )}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('intro-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Intro
            </Button>
            <input
              id="intro-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'intro')}
            />
          </div>
        </Card>

        {/* Main Audio Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Main Audio</h2>
          {mainAudioUrl && (
            <audio
              src={mainAudioUrl}
              controls
              className="w-full mb-4"
            />
          )}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('main-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Main Audio
            </Button>
            <input
              id="main-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'main')}
            />
          </div>
        </Card>

        {/* Outro Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Outro</h2>
          {outroAudioUrl && (
            <audio
              src={outroAudioUrl}
              controls
              className="w-full mb-4"
            />
          )}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('outro-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Outro
            </Button>
            <input
              id="outro-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'outro')}
            />
          </div>
        </Card>

        {/* Merge Button */}
        <Card className="p-6">
          <Button 
            onClick={mergeAndDownload} 
            disabled={isProcessing || (!mainAudioFile && !introAudioFile && !outroAudioFile)}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Merge and Download'}
          </Button>
        </Card>
      </div>
    </div>
  );
}