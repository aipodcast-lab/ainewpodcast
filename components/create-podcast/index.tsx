'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import PodcastHeader from './header'
import PodcastForm from './podcast-form'
import { createPodcastAudio } from '@/lib/script-generator'

export default function CreatePodcast() {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [script, setScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePodcast = async () => {
    if (!script) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please generate or write a script first'
      })
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const audioUrl = await createPodcastAudio({ script }, 'en-US-Neural2-D')

      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Success',
        description: 'Podcast generated and downloaded successfully!'
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate podcast'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-8'>
      <PodcastHeader />

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-8'>
        <PodcastForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onScriptGenerated={setScript}
          isGenerating={isGenerating}
          onGenerate={handleGeneratePodcast}
          hasScript={!!script}
        />
      </div>
    </div>
  )
}
