import { useState } from "react";

export default function QuizPanel({ quiz }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const current = quiz[index];

  const handleSelect = (letter) => {
    if (answered) return;
    setSelected(letter);
    setAnswered(true);
    if (letter === current.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (index + 1 === quiz.length) setFinished(true);
    else { setIndex(i => i + 1); setSelected(null); setAnswered(false); }
  };

  const handleRestart = () => {
    setIndex(0); setSelected(null); setScore(0); setFinished(false); setAnswered(false);
  };

  if (finished) {
    const percent = Math.round((score / quiz.length) * 100);
    return (
      <div style={{ maxWidth: '560px' }}>
        <div className="p-10 text-center" style={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', boxShadow: '0 12px 40px rgba(44,52,55,0.06)' }}>
          <div className="text-5xl mb-4">{percent >= 80 ? '🏆' : percent >= 50 ? '💪' : '📚'}</div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#2c3437' }}>Quiz Complete!</h2>
          <div className="text-5xl font-extrabold my-6" style={{ color: '#426656' }}>{score}<span className="text-2xl text-gray-300">/{quiz.length}</span></div>
          <div className="w-full rounded-full h-2 mb-6" style={{ backgroundColor: '#f0f4f7' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: percent >= 80 ? '#426656' : percent >= 50 ? '#f59e0b' : '#ef4444' }} />
          </div>
          <p className="text-sm mb-8" style={{ color: '#596064' }}>
            {percent >= 80 ? 'Excellent work! You really know this material.' : percent >= 50 ? 'Good effort! Review the missed questions and try again.' : 'Keep studying and give it another shot!'}
          </p>
          <button
            onClick={handleRestart}
            className="px-8 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: '#426656', color: '#ffffff', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(66,102,86,0.3)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#2c3437' }}>📝 Quiz</h2>
        <span className="text-xs font-semibold px-3 py-1" style={{ backgroundColor: '#e4eaed', color: '#596064', borderRadius: '9999px' }}>
          {index + 1} / {quiz.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full rounded-full h-1.5 mb-8" style={{ backgroundColor: '#e4eaed' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / quiz.length) * 100}%`, backgroundColor: '#426656' }}
        />
      </div>

      {/* Question card */}
      <div className="p-7 mb-5" style={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', boxShadow: '0 12px 40px rgba(44,52,55,0.04)' }}>
        <p className="text-base font-semibold leading-relaxed" style={{ color: '#2c3437' }}>{current.question}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-5">
        {current.options.map((opt) => {
          const letter = opt[0];
          const isCorrect = letter === current.answer;
          const isSelected = letter === selected;

          let bg = '#ffffff';
          let border = '#e4eaed';
          let color = '#2c3437';
          let icon = null;

          if (answered) {
            if (isCorrect) { bg = 'rgba(195,236,215,0.3)'; border = '#426656'; color = '#2c3437'; icon = '✓'; }
            else if (isSelected) { bg = 'rgba(254,224,226,0.5)'; border = '#ef4444'; color = '#2c3437'; icon = '✗'; }
            else { color = '#acb3b7'; }
          }

          return (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              className="text-left px-5 py-4 transition-all duration-200 flex items-center justify-between"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${border}`,
                borderRadius: '1rem',
                color,
                cursor: answered ? 'default' : 'pointer',
                transform: !answered ? undefined : undefined,
              }}
            >
              <span className="text-sm font-medium">{opt}</span>
              {icon && (
                <span className="text-sm font-bold flex-shrink-0 ml-3" style={{ color: isCorrect ? '#426656' : '#ef4444' }}>
                  {icon}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {answered && (
        <div className="p-5 mb-2" style={{ backgroundColor: '#f0f4f7', borderRadius: '1rem' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#596064' }}>
            <span className="font-bold" style={{ color: '#426656' }}>Explanation: </span>
            {current.explanation}
          </p>
          <button
            onClick={handleNext}
            className="mt-4 px-6 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: '#426656', color: '#ffffff', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(66,102,86,0.25)' }}
          >
            {index + 1 === quiz.length ? 'See Results →' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}