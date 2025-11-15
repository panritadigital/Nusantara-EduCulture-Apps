import React, { useState } from 'react';
import { Assessment, Question, QuestionType, MultipleChoiceQuestion, StudentAnswer, StudentScore, UserType } from '../types';

interface AssessmentTakerProps {
  assessment: Assessment;
  user: { type: UserType; name: string; schoolId: string; };
  onSubmit: (submission: StudentScore) => void;
  onClose: () => void;
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({ assessment, user, onSubmit, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number | string>>(new Map());
  const [showSummary, setShowSummary] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [mcqCount, setMcqCount] = useState(0);

  const currentQuestion = assessment.questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, answer: number | string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan dan mengumpulkan assessment ini?")) {
        return;
    }
    
    let correctCount = 0;
    const mcqs = assessment.questions.filter(q => q.type === QuestionType.PilihanGanda) as MultipleChoiceQuestion[];
    
    const studentAnswers: StudentAnswer[] = [];
    answers.forEach((answer, questionId) => {
        studentAnswers.push({ questionId, answer });
    });

    studentAnswers.forEach(ans => {
        const question = mcqs.find(q => q.id === ans.questionId);
        if (question && question.correctAnswerIndex === ans.answer) {
            correctCount++;
        }
    });

    const score = mcqs.length > 0 ? Math.round((correctCount / mcqs.length) * 100) : 100;
    
    setFinalScore(score);
    setMcqCount(mcqs.length);
    setShowSummary(true);

    const submission: StudentScore = {
      studentName: user.name,
      assessmentId: assessment.id,
      score: score,
      answers: studentAnswers,
      schoolId: user.schoolId,
    };
    
    // We call onSubmit here, so the parent knows the test is done,
    // even while the summary is still showing.
    onSubmit(submission);
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.get(question.id);

    switch (question.type) {
      case QuestionType.PilihanGanda:
        const mcq = question as MultipleChoiceQuestion;
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-text">{mcq.question}</h3>
            <div className="space-y-2">
              {mcq.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(mcq.id, index)}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${currentAnswer === index ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white hover:bg-brand-background'}`}
                >
                  <span className={`font-semibold mr-2`}>{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case QuestionType.Essay:
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-text">{question.question}</h3>
            <textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Ketik jawaban Anda disini..."
              className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  if (showSummary) {
    const hasEssays = assessment.questions.some(q => q.type === QuestionType.Essay);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
                 <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-brand-primary">Assessment Selesai!</h2>
                <p className="text-gray-600 mt-2">Jawaban Anda telah berhasil dikumpulkan.</p>
                <div className="my-6 space-y-2">
                    {mcqCount > 0 && (
                        <p className="text-lg">Skor Pilihan Ganda: <span className="font-bold text-brand-primary text-2xl">{finalScore}</span></p>
                    )}
                    {hasEssays && (
                        <p className="text-sm text-gray-500">Jawaban Esai akan diperiksa oleh guru.</p>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                >
                    Kembali ke Daftar Assessment
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brand-background z-[100] flex flex-col">
      <header className="p-4 bg-white border-b shadow-sm">
        <h2 className="text-xl font-bold text-brand-primary text-center">{assessment.title}</h2>
        <p className="text-center text-sm text-gray-500">{assessment.type}</p>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-4">
                <p className="font-semibold text-brand-secondary">
                    Soal {currentQuestionIndex + 1} dari {assessment.questions.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%` }}></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderQuestion(currentQuestion)}
            </div>
        </div>
      </main>
      <footer className="p-4 bg-white border-t flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Kembali
        </button>
        {currentQuestionIndex === assessment.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
          >
            Selesai & Kumpulkan
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-brand-primary text-white rounded-full font-semibold hover:bg-opacity-90"
          >
            Selanjutnya
          </button>
        )}
      </footer>
    </div>
  );
};

export default AssessmentTaker;