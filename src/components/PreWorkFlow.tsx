'use client';

import { useState } from 'react';
import QuestionCard from './QuestionCard';

const PRE_WORK_QUESTIONS = [
  'What are you trying to accomplish this cycle?',
  'Do you have everything you need? Water? Is the environment good?',
  'What is the very first thing to do that will get you started?',
  'How will you know if you accomplished your cycle target?',
  'Why might you fail? (What are possible distractions?) How to mitigate?',
];

const CONDENSED_QUESTIONS = [
  'What are you trying to accomplish this cycle?',
  'What is the very first thing to do that will get you started?',
];

interface PreWorkFlowProps {
  onComplete: (answers: {
    target: string;
    environment_check: string;
    first_step: string;
    success_criteria: string;
    failure_risks: string;
  }) => void;
  condensed?: boolean;
  prefilledTarget?: string;
}

export default function PreWorkFlow({ onComplete, condensed = false, prefilledTarget }: PreWorkFlowProps) {
  // When prefilledTarget is set, skip question 0 (the target question)
  const allQuestions = condensed ? CONDENSED_QUESTIONS : PRE_WORK_QUESTIONS;
  const questions = prefilledTarget ? allQuestions.slice(1) : allQuestions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function handleAnswer(answer: string) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (condensed) {
      const target = prefilledTarget ?? newAnswers[0];
      const firstStep = prefilledTarget ? newAnswers[0] : newAnswers[1];
      onComplete({
        target,
        environment_check: '',
        first_step: firstStep,
        success_criteria: '',
        failure_risks: '',
      });
    } else if (prefilledTarget) {
      onComplete({
        target: prefilledTarget,
        environment_check: newAnswers[0],
        first_step: newAnswers[1],
        success_criteria: newAnswers[2],
        failure_risks: newAnswers[3],
      });
    } else {
      onComplete({
        target: newAnswers[0],
        environment_check: newAnswers[1],
        first_step: newAnswers[2],
        success_criteria: newAnswers[3],
        failure_risks: newAnswers[4],
      });
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-8">
        {condensed ? 'Quick Check-In' : 'Pre-Work Reflection'}
      </h3>
      {prefilledTarget && (
        <div className="w-full max-w-md mb-6 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-center">
          <span className="text-foreground/40 text-xs uppercase tracking-wider">This cycle&apos;s target</span>
          <p className="text-foreground/80 text-sm mt-1">{prefilledTarget}</p>
        </div>
      )}
      <QuestionCard
        key={currentQuestion}
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        onSubmit={handleAnswer}
      />
    </div>
  );
}
