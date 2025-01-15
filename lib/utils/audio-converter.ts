export function base64ToBuffer(base64: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:audio\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export function validateAudioBuffer(buffer: Buffer): void {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid audio buffer');
  }
  
  if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Audio file size exceeds 10MB limit');
  }
}