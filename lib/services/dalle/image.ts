import { config } from '@/lib/config';

export async function generateThumbnail(prompt: string): Promise<string> {
  if (!config.openai.apiKey) {
    throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a podcast cover art for "${prompt}". Make it modern, professional and visually appealing. Use vibrant colors and clean design.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('DALL-E API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    if (!data.data?.[0]?.url) {
      throw new Error('No image URL received from DALL-E');
    }

    return data.data[0].url;
  } catch (error) {
    console.error('Image generation error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate thumbnail: ${error.message}`);
    }
    throw new Error('Failed to generate thumbnail');
  }
}