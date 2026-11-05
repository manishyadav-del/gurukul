"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function QuizRunnerPage({ params }) {
  const unwrappedParams = use(params);
  const quizIdOrSlug = unwrappedParams.slug;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz running state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quizzes/${quizIdOrSlug}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load quiz");
        }
        setQuiz(data.quiz);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizIdOrSlug]);

  const handleSelectOption = (questionId, optionId) => {
    if (attemptResult) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitAttempt = async () => {
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedAnswers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );

      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersPayload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grade quiz");
      }

      setAttemptResult(data);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setAttemptResult(null);
    setCurrentQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-600">Loading Vedic astrology quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 bg-white rounded-2xl border border-stone-200 mt-10">
        <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-serif">Quiz Unavailable</h2>
        <p className="text-xs text-stone-500">{error || "The requested quiz could not be found."}</p>
        <Link
          href="/quiz"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quizzes</span>
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Quiz Top Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Quizzes</span>
        </Link>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
          Difficulty: {quiz.difficulty}
        </span>
      </div>

      {/* Quiz Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          {quiz.title}
        </h1>
        {quiz.description && (
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Result View when submitted */}
      {attemptResult ? (
        <div className="space-y-8">
          {/* Result Score Banner */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-amber-100 text-amber-900">
              <Award className="w-8 h-8 text-amber-700" />
            </div>

            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                  attemptResult.passed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {attemptResult.passed ? "Passed — Well Done!" : "Completed — Review Recommended"}
              </span>

              <h2 className="text-3xl font-bold font-serif text-stone-900">
                Score: {attemptResult.score} / {attemptResult.totalQuestions} ({attemptResult.percentage}%)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Your answers have been graded on the server against approved scripture passages.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
              >
                <span>View in Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review with Grounded Scripture Citations */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Answer Review & Explanations:
            </h3>

            {attemptResult.evaluatedAnswers.map((ea, idx) => (
              <div
                key={ea.questionId}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 ${
                  ea.isCorrect ? "border-emerald-200" : "border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {ea.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-stone-500">Question {idx + 1}</span>
                      <p className="text-sm font-semibold text-stone-900 mt-0.5">{ea.question}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      ea.isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {ea.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <div className="text-xs space-y-1 pl-7">
                  <div className="text-stone-700">
                    <span className="font-medium text-stone-500">Your Answer: </span>
                    <span className={ea.isCorrect ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}>
                      {ea.selectedOptionText}
                    </span>
                  </div>

                  {!ea.isCorrect && (
                    <div className="text-stone-700">
                      <span className="font-medium text-stone-500">Correct Answer: </span>
                      <span className="text-emerald-700 font-semibold">{ea.correctOptionText}</span>
                    </div>
                  )}

                  {ea.explanation && (
                    <div className="mt-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-stone-700 text-xs leading-relaxed">
                      <strong>Explanation: </strong> {ea.explanation}
                    </div>
                  )}

                  {ea.sourcePassage && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-amber-900">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">
                          Source: {ea.sourcePassage.bookTitle} (Ch: {ea.sourcePassage.chapterTitle}
                          {ea.sourcePassage.sourcePage ? `, Page ${ea.sourcePassage.sourcePage}` : ""})
                        </span>
                      </div>
                      {ea.sourcePassage.readerUrl && (
                        <Link
                          href={ea.sourcePassage.readerUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:underline shrink-0"
                        >
                          <span>Read passage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Interactive Question Stepper View */
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{progressPercent}% answered</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Question #{currentQuestionIndex + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 text-sm ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/80 text-amber-950 font-semibold ring-1 ring-amber-500"
                          : "border-stone-200 hover:border-stone-300 text-stone-800 bg-white"
                      }`}
                    >
                      <span>{opt.text}</span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-amber-700 bg-amber-700 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stepper Navigation Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition disabled:opacity-30"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || answeredCount === 0}
                    onClick={handleSubmitAttempt}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <span>Grading on Server...</span>
                    ) : (
                      <>
                        <span>Submit Assessment</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Question Jump Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-amber-700 text-white shadow-xs"
                      : isAnswered
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
