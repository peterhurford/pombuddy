'use client';

import { useState } from 'react';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string) => void;
  type?: 'text' | 'buttons';
  options?: string[];
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  type = 'text',
  options = [],
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');

  function handleSubmit() {
    if (type === 'text' && !answer.trim()) return;
    onSubmit(answer.trim());
    setAnswer('');
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up" key={questionNumber}>
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-foreground/30 uppercase tracking-[0.15em] font-medium">
            {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < questionNumber ? 'bg-accent w-4' : 'bg-card-border w-1.5'
                }`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold mb-6 leading-relaxed">{question}</h2>

        {type === 'text' ? (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-background/50 border border-card-border rounded-xl p-4 text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="mt-4 w-full py-3.5 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {questionNumber === totalQuestions ? 'Submit' : 'Next'}
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => onSubmit(option)}
                className="py-3.5 px-4 bg-background/50 border border-card-border rounded-xl text-foreground hover:border-accent/50 hover:text-accent transition-all duration-200 font-medium active:scale-[0.97]"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
