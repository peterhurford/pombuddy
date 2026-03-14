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
}

export default function PreWorkFlow({ onComplete, condensed = false }: PreWorkFlowProps) {
  const questions = condensed ? CONDENSED_QUESTIONS : PRE_WORK_QUESTIONS;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function handleAnswer(answer: string) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (condensed) {
      onComplete({
        target: newAnswers[0],
        environment_check: '',
        first_step: newAnswers[1],
        success_criteria: '',
        failure_risks: '',
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
