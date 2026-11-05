"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  BookOpen,
  Award,
} from "lucide-react";

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "MEDIUM",
    topic: "",
    isPublished: true,
    questions: [
      {
        question: "",
        explanation: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ],
  });

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quizzes?includeDrafts=true");
      const data = await res.json();
      if (res.ok) {
        setQuizzes(data.quizzes || []);
      }
    } catch (e) {
      console.error("Failed to load quizzes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleTogglePublish = async (quiz) => {
    try {
      const nextStatus = !quiz.isPublished;
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      if (res.ok) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === quiz.id ? { ...q, isPublished: nextStatus } : q))
        );
      }
    } catch (e) {
      alert("Failed to toggle publication status");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      }
    } catch (e) {
      alert("Failed to delete quiz");
    }
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          explanation: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const handleAddOption = (qIdx) => {
    setFormData((prev) => {
      const copy = { ...prev };
      const q = copy.questions[qIdx];
      if (q.options.length < 5) {
        q.options.push({ text: "", isCorrect: false });
      }
      return copy;
    });
  };

  const handleSetCorrectOption = (qIdx, optIdx) => {
    setFormData((prev) => {
      const copy = { ...prev };
      const q = copy.questions[qIdx];
      q.options.forEach((opt, idx) => {
        opt.isCorrect = idx === optIdx;
      });
      return copy;
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      setShowCreateModal(false);
      loadQuizzes();
      // Reset form
      setFormData({
        title: "",
        description: "",
        difficulty: "MEDIUM",
        topic: "",
        isPublished: true,
        questions: [
          {
            question: "",
            explanation: "",
            options: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
            ],
          },
        ],
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">Quizzes Management</h1>
          <p className="text-xs text-stone-500">
            Create, publish, and review astrology assessments grounded in digitized manuscripts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No quizzes found.</p>
          <p className="text-xs text-stone-400 mt-1">Create your first quiz using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-xs uppercase font-semibold text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Book Source</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-stone-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-stone-900">{q.title}</td>
                    <td className="px-6 py-4 text-xs">{q.book?.title || "General Scripture"}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-stone-100 font-medium">
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{q._count?.questions || 0}</td>
                    <td className="px-6 py-4 text-xs font-medium">{q._count?.attempts || 0}</td>
                    <td className="px-6 py-4 text-xs">
                      <button
                        onClick={() => handleTogglePublish(q)}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                          q.isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {q.isPublished ? "Published" : "Draft (Hidden)"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-700" />
                <h2 className="font-bold text-stone-900 font-serif text-lg">Author New Quiz</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-stone-700 block mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Navamsha & Planetary Strengths Quiz"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-stone-700 block mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Topic / Subject</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Bhavas, Rashis, Dasha Analysis"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of what this quiz covers..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-sm">Questions ({formData.questions.length})</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-amber-800 hover:text-amber-900 font-bold text-xs"
                  >
                    + Add Question
                  </button>
                </div>

                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Question #{qIdx + 1} *
                      </label>
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const copy = { ...prev };
                            copy.questions[qIdx].question = val;
                            return copy;
                          });
                        }}
                        placeholder="Enter the question text..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Explanation (Shown after completion)
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const copy = { ...prev };
                            copy.questions[qIdx].explanation = val;
                            return copy;
                          });
                        }}
                        placeholder="Why is the correct answer correct according to the scriptures?"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-600 text-[11px]">Options (Select correct radio)</span>
                        {q.options.length < 5 && (
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="text-amber-700 text-[11px] font-semibold"
                          >
                            + Option
                          </button>
                        )}
                      </div>

                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_q_${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                            className="w-4 h-4 text-amber-700"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const copy = { ...prev };
                                copy.questions[qIdx].options[optIdx].text = val;
                                return copy;
                              });
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Quiz..." : "Create & Save Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
