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
      <div className="bg-card-bg border border-card-border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-foreground/40 uppercase tracking-widest">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < questionNumber ? 'bg-accent' : 'bg-card-border'
                }`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6 leading-relaxed">{question}</h2>

        {type === 'text' ? (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-background border border-card-border rounded-xl p-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-colors resize-none"
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
              className="mt-4 w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="py-3 px-4 bg-background border border-card-border rounded-xl text-foreground hover:border-accent hover:text-accent transition-colors font-medium"
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
