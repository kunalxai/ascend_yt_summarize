// Clean text — strip all markdown bold/italic markers
function clean(text = '') {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

// Robust parser — works regardless of spacing or emoji variations
function parseSummary(raw) {
  const result = {
    overview: '',
    keyMetric: '',
    keyQuote: '',
    concepts: '',
    insights: [],
    actions: [],
    questions: [],
  };

  if (!raw) return result;

  const lines = raw.split('\n');
  let currentSection = null;
  let buffer = [];

  const flush = () => {
    if (!currentSection) return;
    const text = buffer.join('\n').trim();

    if (currentSection.includes('What This Video Is About')) {
      result.overview = clean(text);
    } else if (currentSection.includes('Key Metric')) {
      result.keyMetric = clean(text);
    } else if (currentSection.includes('Key Quote')) {
      result.keyQuote = clean(text);
    } else if (currentSection.includes('Core Concepts')) {
      result.concepts = text;
    } else if (currentSection.includes('Key Insights') || currentSection.includes('Takeaways')) {
      result.insights = text.split('\n')
        .filter(l => l.trim().match(/^[-•*]/) || l.trim().match(/^\d+\./))
        .map(l => clean(l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')))
        .filter(Boolean);
    } else if (currentSection.includes('What You Can Do') || currentSection.includes('Action')) {
      result.actions = text.split('\n')
        .filter(l => l.trim().match(/^[-•*]/) || l.trim().match(/^\d+\./))
        .map(l => clean(l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')))
        .filter(Boolean);
    } else if (currentSection.includes('Questions')) {
      result.questions = text.split('\n')
        .filter(l => l.trim().match(/^[-•*]/) || l.trim().match(/^\d+\./))
        .map(l => clean(l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')))
        .filter(Boolean);
    }

    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flush();
      currentSection = line.replace(/^##?\s*/, '').trim();
    } else {
      buffer.push(line);
    }
  }
  flush();

  return result;
}

// Get prose from a block of text (non-bullet lines)
function getProse(text = '') {
  return text.split('\n')
    .filter(l => l.trim() && !l.trim().match(/^[-•*]/) && !l.trim().match(/^\d+\./))
    .map(l => clean(l))
    .filter(Boolean)
    .join(' ');
}

// Get bullets from a block of text
function getBullets(text = '') {
  return text.split('\n')
    .filter(l => l.trim().match(/^[-•*]/) || l.trim().match(/^\d+\./))
    .map(l => clean(l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')))
    .filter(Boolean);
}

function SummaryPanel({ summary, loading, videoTitle }) {

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8 md:p-12" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="max-w-3xl animate-pulse space-y-6">
          <div className="h-3 w-28 rounded-full" style={{ backgroundColor: '#fef0f1' }} />
          <div className="h-10 w-3/4 rounded-xl" style={{ backgroundColor: '#e3e9ed' }} />
          <div className="h-5 w-full rounded-lg" style={{ backgroundColor: '#eaeff2' }} />
          <div className="h-5 w-5/6 rounded-lg" style={{ backgroundColor: '#eaeff2' }} />
          <div className="flex gap-6 pt-4">
            <div className="flex-1 h-56 rounded-2xl" style={{ backgroundColor: '#f0f4f7' }} />
            <div className="w-48 flex flex-col gap-4">
              <div className="flex-1 rounded-2xl" style={{ backgroundColor: '#dbe2fa', opacity: 0.5 }} />
              <div className="flex-1 rounded-2xl" style={{ backgroundColor: '#fef0f1', opacity: 0.7 }} />
            </div>
          </div>
          <p className="text-center text-xs pt-4" style={{ color: '#747c80' }}>
            Generating your intelligence report...
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(195,236,215,0.3)', borderRadius: '1.5rem' }}>
            <span className="text-4xl">🎓</span>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#2c3437' }}>Intelligence Report</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#596064' }}>
            Paste a YouTube URL and click Summarize to generate a rich structured learning summary.
          </p>
        </div>
      </div>
    );
  }

  const { overview, keyMetric, keyQuote, concepts, insights, actions, questions } = parseSummary(summary);
  const conceptProse = getProse(concepts);
  const conceptBullets = getBullets(concepts);

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f7f9fb', scrollbarWidth: 'thin' }}>
      <div className="p-8 md:p-12" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase" style={{ backgroundColor: '#fef0f1', color: '#63595b', borderRadius: '9999px' }}>
              Intelligence Report
            </span>
            <span className="text-xs" style={{ color: '#747c80' }}>• AI-generated summary</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight" style={{ color: '#2c3437' }}>
            {videoTitle || 'Your Learning Summary'}
          </h1>
          {overview && (
            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#596064', maxWidth: '640px' }}>
              {overview}
            </p>
          )}
        </header>

        {/* Bento grid */}
        <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>

          {/* Core essence */}
          <div className="col-span-12 md:col-span-7 p-7 relative overflow-hidden" style={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', boxShadow: '0 12px 40px rgba(44,52,55,0.04)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 -mr-5 -mt-5" style={{ backgroundColor: 'rgba(195,236,215,0.2)', borderBottomLeftRadius: '100%' }} />
            <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#2c3437' }}>
              <span style={{ color: '#426656' }}>✦</span> The Core Essence
            </h3>
            {conceptProse ? (
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#596064' }}>{conceptProse}</p>
            ) : (
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#596064' }}>{overview}</p>
            )}
            {conceptBullets.length > 0 && (
              <ul className="space-y-2">
                {conceptBullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: '#596064' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#426656' }} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar cards */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            <div className="p-6 flex-1 transition-transform duration-300 hover:-translate-y-1" style={{ backgroundColor: '#dbe2fa', borderRadius: '1.5rem' }}>
              <h4 className="font-bold uppercase text-[10px] tracking-widest mb-2" style={{ color: '#4a5165' }}>Key Metric</h4>
              {keyMetric && keyMetric !== 'N/A' && keyMetric.length > 0 ? (
                <div className="text-xl font-extrabold leading-tight" style={{ color: '#4a5165' }}>{keyMetric}</div>
              ) : (
                <>
                  <div className="text-2xl mb-1">📈</div>
                  <p className="text-xs" style={{ color: 'rgba(74,81,101,0.7)' }}>No specific metric in this video</p>
                </>
              )}
            </div>
            <div className="p-6 flex-1 transition-transform duration-300 hover:-translate-y-1" style={{ backgroundColor: '#fef0f1', borderRadius: '1.5rem' }}>
              <h4 className="font-bold uppercase text-[10px] tracking-widest mb-2" style={{ color: '#63595b' }}>Key Quote</h4>
              <p className="font-semibold text-sm leading-snug" style={{ color: '#63595b' }}>
                {keyQuote && keyQuote.length > 3 ? keyQuote : 'Core insight extracted from this video.'}
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="p-7 mb-5 transition-colors duration-300" style={{ backgroundColor: '#f0f4f7', borderRadius: '1.5rem' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: '#2c3437' }}>💡 Key Insights & Takeaways</h3>
            <ul className="space-y-3">
              {insights.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: '#596064' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#426656' }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="p-7 mb-5 relative overflow-hidden" style={{ backgroundColor: 'rgba(195,236,215,0.2)', borderRadius: '1.5rem' }}>
            <h3 className="text-lg font-bold mb-5 relative z-10" style={{ color: '#345949' }}>✅ What You Can Do With This</h3>
            <div className="space-y-3 relative z-10">
              {actions.map((b, i) => (
                <label key={i} className="flex items-start gap-3 p-3 cursor-pointer group transition-colors duration-200" style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '0.75rem' }}>
                  <input type="checkbox" className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ accentColor: '#426656' }} />
                  <span className="text-sm font-medium" style={{ color: '#2c3437' }}>{b}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="p-7 mb-8 transition-colors duration-300" style={{ backgroundColor: '#f0f4f7', borderRadius: '1.5rem' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: '#2c3437' }}>🔍 Questions To Think About</h3>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="pl-4 py-1" style={{ borderLeft: '2px solid rgba(66,102,86,0.3)' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#596064' }}>{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 pb-8">
          <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: '#acb3b7' }}>
            AI-Generated Synthesis • Use as a learning aid • Ascend
          </p>
        </footer>

      </div>
    </div>
  );
}

export default SummaryPanel;