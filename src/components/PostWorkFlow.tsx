'use client';

import { useState } from 'react';
import QuestionCard from './QuestionCard';

interface PostWorkFlowProps {
  onComplete: (answers: {
    completed_status: string;
    incomplete_reason: string;
    break_plan: string;
  }) => void;
}

type Step = 'status' | 'reason' | 'break';

export default function PostWorkFlow({ onComplete }: PostWorkFlowProps) {
  const [step, setStep] = useState<Step>('status');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');

  function handleStatusAnswer(answer: string) {
    setStatus(answer);
    if (answer === 'Yes') {
      setStep('break');
    } else {
      setStep('reason');
    }
  }

  function handleReasonAnswer(answer: string) {
    setReason(answer);
    setStep('break');
  }

  function handleBreakAnswer(answer: string) {
    onComplete({
      completed_status: status.toLowerCase().replace(' ', '_'),
      incomplete_reason: reason,
      break_plan: answer,
    });
  }

  const totalQuestions = status === 'Yes' ? 2 : 3;

  if (step === 'status') {
    return (
      <div className="w-full flex flex-col items-center">
        <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-8">
          Post-Work Review
        </h3>
        <QuestionCard
          key="status"
          question="Completed target?"
          questionNumber={1}
          totalQuestions={totalQuestions}
          onSubmit={handleStatusAnswer}
          type="buttons"
          options={['Yes', 'Mostly Yes', 'Mostly No', 'No']}
        />
      </div>
    );
  }

  if (step === 'reason') {
    return (
      <div className="w-full flex flex-col items-center">
        <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-8">
          Post-Work Review
        </h3>
        <QuestionCard
          key="reason"
          question="Why was target not met?"
          questionNumber={2}
          totalQuestions={totalQuestions}
          onSubmit={handleReasonAnswer}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-8">
        Post-Work Review
      </h3>
      <QuestionCard
        key="break"
        question="What to do this break to recharge energy/morale if needed? Speed square? Just Dance?"
        questionNumber={totalQuestions}
        totalQuestions={totalQuestions}
        onSubmit={handleBreakAnswer}
      />
    </div>
  );
}
