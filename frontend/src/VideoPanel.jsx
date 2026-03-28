function VideoPanel({ videoId }) {
  if (!videoId) {
    return (
      <div className="w-full flex items-center justify-center" style={{ aspectRatio: '16/9', backgroundColor: '#2c3437', borderRadius: '1rem' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <svg className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.5)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Video will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" style={{ aspectRatio: '16/9', borderRadius: '1rem', boxShadow: '0 12px 40px rgba(44,52,55,0.15)' }}>
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

export default VideoPanel;