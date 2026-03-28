export async function getTranscript(videoId) {

  const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;

  const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`, {
    headers: {
      'x-api-key': SUPADATA_API_KEY
    }
  });

  const data = await response.json();

  if (!data || !data.content) {
    throw new Error('No transcript available for this video');
  }

  // content is an array of segments — join them into one string
  const fullText = data.content
    .map(segment => segment.text)
    .join(' ')
    .trim();

  return fullText;
}