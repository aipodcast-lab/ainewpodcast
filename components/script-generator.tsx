'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generatePodcastScript } from '@/lib/script-generator'

interface ScriptGeneratorProps {
  title: string
  description: string
  duration: string
  onScriptGenerated: (script: string) => void
  beforeGenerate?: () => void | Error
  speakers?: { name: string; voice: string; gender: 'male' | 'female' }[]
}

export default function ScriptGenerator({
  title,
  description,
  duration = 'short',
  onScriptGenerated,
  beforeGenerate,
  speakers
}: ScriptGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [script, setScript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setScript('')
  }, [speakers])

  const handleGenerateScript = async () => {
    if (beforeGenerate) {
      const result = beforeGenerate()
      if (result instanceof Error) {
        setError(result.message)
        return
      }
    }
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a podcast title'
      })
      return
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError(
        'Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.'
      )
      return
    }

    setIsGenerating(true)
    setError(null)
    const durationString = () => {
      switch (duration) {
        case 'medium':
          return '5000 - 8000 words'
        case 'long':
          return '10000 - 15000 words'
        default:
          return '2 to 5 minutes'
      }
    }
    try {
      const generatedScript = await generatePodcastScript(
        title,
        description + ` The script should long between ${durationString()}.`,
        speakers
      )
      setScript(generatedScript)
      onScriptGenerated(generatedScript)
      toast({
        title: 'Success',
        description: 'Podcast script generated successfully!'
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate script'
      if (errorMessage.includes('quota')) {
        setError(
          'Gemini API quota exceeded. Please check your billing details or try again later.'
        )
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center'>
        <label className='block text-sm font-medium'>
          AI prompt to generate podcast
        </label>
        <Button
          variant='outline'
          onClick={handleGenerateScript}
          disabled={isGenerating || !process.env.NEXT_PUBLIC_GEMINI_API_KEY}>
          {isGenerating && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          Generate Script
        </Button>
      </div>
      <Textarea
        value={script}
        onChange={(e) => {
          setScript(e.target.value)
          onScriptGenerated(e.target.value)
        }}
        placeholder={
          !process.env.NEXT_PUBLIC_GEMINI_API_KEY
            ? 'Gemini API key not configured. Please add your API key to use AI generation, or write your script manually.'
            : "Click 'Generate Script' to create a podcast script, or write your own"
        }
        className='min-h-[200px]'
      />
    </div>
  )
}
