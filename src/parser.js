// This function takes a YouTube URL and returns just the video ID
export function extractVideoId(url) {

  // These are the different URL patterns YouTube uses
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,   // standard watch URL
    /youtu\.be\/([^?]+)/,               // shortened URL
    /youtube\.com\/embed\/([^?]+)/,     // embedded URL
    /youtube\.com\/shorts\/([^?]+)/     // shorts URL
  ];

  // Try each pattern one by one
  for (const pattern of patterns) {
    const match = url.match(pattern);

    // If a pattern matches, return the captured video ID
    if (match) return match[1];
  }

  // If nothing matched, the URL is invalid
  throw new Error('Invalid YouTube URL');
}