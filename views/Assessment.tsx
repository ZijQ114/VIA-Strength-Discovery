import React, { useState } from 'react';
import { ASSESSMENT_QUESTIONS, ALL_STRENGTHS } from '../constants';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: (topStrengthIds: number[]) => void;
  onCancel: () => void;
}

const Assessment: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of questionId -> score (1-5)
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (score: number) => {
    const nextAnswers = { ...answers, [ASSESSMENT_QUESTIONS[currentIndex].id]: score };
    setAnswers(nextAnswers);

    if (currentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishAssessment(nextAnswers);
    }
  };

  const finishAssessment = (finalAnswers: Record<number, number>) => {
    // Calculate scores per strength
    const strengthScores: Record<number, number> = {};

    ASSESSMENT_QUESTIONS.forEach(q => {
      const score = finalAnswers[q.id] || 0;
      strengthScores[q.strengthId] = (strengthScores[q.strengthId] || 0) + score;
    });

    // Convert to array and sort
    const sortedStrengths = Object.keys(strengthScores)
      .map(idStr => {
        const id = parseInt(idStr);
        return {
          id,
          score: strengthScores[id]
        };
      })
      .sort((a, b) => b.score - a.score);

    // Take top 10
    const topIds = sortedStrengths.slice(0, 10).map(s => s.id);
    onComplete(topIds);
  };

  const progress = ((currentIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 animate-fadeIn">
       <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Question {currentIndex + 1} of {ASSESSMENT_QUESTIONS.length}
          </span>
          <button onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-rose-500">
            Exit
          </button>
       </div>
       
       <div className="w-full bg-slate-100 h-1">
          <div className="bg-indigo-500 h-1 transition-all duration-300" style={{ width: `${progress}%` }}></div>
       </div>

       <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-tight">
            "{currentQuestion.text}"
          </h3>

          <div className="w-full max-w-md space-y-3">
             <div className="flex justify-between px-2 text-xs font-bold text-slate-400 uppercase mb-2">
                <span>Very Unlike Me</span>
                <span>Very Like Me</span>
             </div>
             <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className="aspect-square rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 font-bold text-lg transition-all focus:ring-2 focus:ring-indigo-200"
                  >
                    {score}
                  </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Assessment;