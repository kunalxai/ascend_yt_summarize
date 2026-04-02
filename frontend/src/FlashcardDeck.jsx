import { useState } from "react";

export default function FlashcardDeck({ flashcards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = flashcards[index];
  const prev = () => { setIndex(i => i - 1); setFlipped(false); };
  const next = () => { setIndex(i => i + 1); setFlipped(false); };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#2c3437' }}>🃏 Flashcards</h2>
        <span className="text-xs font-semibold px-3 py-1" style={{ backgroundColor: '#e4eaed', color: '#596064', borderRadius: '9999px' }}>
          {flashcards.length} cards
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        className="cursor-pointer relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
        style={{
          backgroundColor: flipped ? 'rgba(195,236,215,0.25)' : '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 12px 40px rgba(44,52,55,0.08)',
          minHeight: '200px',
          border: `1.5px solid ${flipped ? 'rgba(66,102,86,0.2)' : '#f0f4f7'}`,
        }}
      >
        <div className="p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
          <span
            className="text-[10px] font-bold uppercase tracking-widest mb-4 px-3 py-1"
            style={{
              backgroundColor: flipped ? 'rgba(66,102,86,0.1)' : '#f0f4f7',
              color: flipped ? '#426656' : '#747c80',
              borderRadius: '9999px',
            }}
          >
            {flipped ? 'Answer' : 'Question'}
          </span>
          <p className="text-base font-medium leading-relaxed" style={{ color: '#2c3437' }}>
            {flipped ? current.back : current.front}
          </p>
          <p className="text-xs mt-6" style={{ color: '#acb3b7' }}>
            {flipped ? 'Click to see question' : 'Click to reveal answer'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-5 py-2.5 text-sm font-semibold transition-all duration-200"
          style={{
            backgroundColor: index === 0 ? '#f0f4f7' : '#ffffff',
            color: index === 0 ? '#acb3b7' : '#2c3437',
            borderRadius: '9999px',
            boxShadow: index === 0 ? 'none' : '0 2px 8px rgba(44,52,55,0.08)',
            border: '1.5px solid #e4eaed',
          }}
        >
          ← Prev
        </button>

        <div className="flex gap-1.5">
          {flashcards.map((_, i) => (
            <div
              key={i}
              onClick={() => { setIndex(i); setFlipped(false); }}
              className="cursor-pointer transition-all duration-200"
              style={{
                width: i === index ? '20px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: i === index ? '#426656' : '#c8d3d9',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={index === flashcards.length - 1}
          className="px-5 py-2.5 text-sm font-semibold transition-all duration-200"
          style={{
            backgroundColor: index === flashcards.length - 1 ? '#f0f4f7' : '#426656',
            color: index === flashcards.length - 1 ? '#acb3b7' : '#ffffff',
            borderRadius: '9999px',
            boxShadow: index === flashcards.length - 1 ? 'none' : '0 4px 12px rgba(66,102,86,0.25)',
            border: '1.5px solid transparent',
          }}
        >
          Next →
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 text-center">
        <span className="text-xs" style={{ color: '#acb3b7' }}>{index + 1} of {flashcards.length}</span>
      </div>
    </div>
  );
}