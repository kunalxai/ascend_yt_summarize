import { useState, useRef, useCallback } from 'react';
import VideoPanel from './VideoPanel';
import SummaryPanel from './SummaryPanel';
import ChatBox from './ChatBox';

function App() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resizable divider state
  const [leftWidth, setLeftWidth] = useState(33); // percentage
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(55, Math.max(22, newWidth)));
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Touch support
  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(55, Math.max(22, newWidth)));
  }, []);

  const handleSummarize = async () => {
    if (!url.trim()) { setError('Please enter a YouTube URL'); return; }
    setError(''); setSummary(''); setVideoId(''); setVideoTitle(''); setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSummary(data.summary);
      setVideoId(data.videoId);
      setVideoTitle(data.videoTitle || 'Video Summary');
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f7f9fb' }}
    >

      {/* Navbar */}
      <nav className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 h-16 z-50"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(44,52,55,0.06)' }}>
        <div className="flex items-center gap-6">
          <span className="text-lg font-extrabold tracking-tight" style={{ color: '#426656' }}>Ascend</span>
          <div className="hidden md:flex gap-5">
            <span className="text-sm font-semibold cursor-pointer pb-0.5" style={{ color: '#426656', borderBottom: '2px solid #426656' }}>My Library</span>
            <span className="text-sm font-medium cursor-pointer" style={{ color: '#596064' }}>Explore</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c3ecd7' }}>
          <span className="text-xs font-bold" style={{ color: '#345949' }}>U</span>
        </div>
      </nav>

      {/* Main */}
      <main
        ref={containerRef}
        className="flex-1 flex overflow-hidden min-h-0"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >

        {/* Left panel */}
        <aside
          className="flex-shrink-0 flex flex-col gap-4 p-5 overflow-y-auto md:overflow-hidden"
          style={{ width: `${leftWidth}%`, backgroundColor: '#f0f4f7', minWidth: '280px' }}
        >

          {/* URL input */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: '#747c80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSummarize()}
              placeholder="Paste YouTube URL here..."
              className="w-full h-12 pl-11 pr-32 text-sm focus:outline-none transition-all"
              style={{ backgroundColor: '#ffffff', borderRadius: '9999px', color: '#2c3437', boxShadow: '0 4px 16px rgba(44,52,55,0.06)' }}
            />
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="absolute right-1.5 top-1.5 h-9 px-5 text-white text-xs font-bold transition-all duration-200"
              style={{ backgroundColor: loading ? '#9ca3af' : '#426656', borderRadius: '9999px' }}
            >
              {loading ? 'Analyzing...' : 'Summarize'}
            </button>
          </div>

          {error && <p className="text-xs font-medium px-2 flex-shrink-0" style={{ color: '#ef4444' }}>⚠️ {error}</p>}

          {/* Video */}
          <div className="flex-shrink-0">
            <VideoPanel videoId={videoId} />
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-2 flex-shrink-0">
              <h3 className="text-sm font-bold" style={{ color: '#2c3437' }}>💬 Chat with this video</h3>
              <p className="text-xs mt-0.5" style={{ color: '#596064' }}>
                {summary ? 'Ask anything about what was covered' : 'Summarize a video to start chatting'}
              </p>
            </div>
            {summary ? (
              <ChatBox summary={summary} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-6">
                <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: '#eaeff2', borderRadius: '1rem' }}>
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-xs" style={{ color: '#596064' }}>Chat unlocks after summarizing</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Divider handle ── */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="group flex-shrink-0 flex items-center justify-center cursor-col-resize z-10 transition-colors duration-150"
          style={{ width: '12px', backgroundColor: 'transparent' }}
          title="Drag to resize"
        >
          {/* Visual pill */}
          <div
            className="h-12 w-1 rounded-full transition-all duration-150 group-hover:h-20 group-hover:w-1.5"
            style={{ backgroundColor: '#c8d3d9' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#426656'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8d3d9'}
          />
        </div>

        {/* Right panel */}
        {/* Right panel */}
<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
  <SummaryPanel summary={summary} loading={loading} videoId={videoId} videoTitle={videoTitle} />
</div>

      </main>
    </div>
  );
}

export default App;