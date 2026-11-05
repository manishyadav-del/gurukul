"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Bot,
  ScanText,
  Activity,
  Info,
} from "lucide-react";

export default function AnalyticsAdminClient({ initialData }) {
  const [data, setData] = useState(initialData || {});
  const [range, setRange] = useState(initialData?.range || "30d");
  const [loading, setLoading] = useState(false);

  const fetchRange = async (newRange) => {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data.metrics || {};
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value", "Window"],
      ["New Registrations", metrics.newUsers || 0, range],
      ["Total Users", metrics.totalUsers || 0, "All Time"],
      ["Reading Sessions", metrics.readingCount || 0, range],
      ["Quiz Attempts", metrics.quizAttempts || 0, range],
      ["Average Quiz Score (%)", metrics.averageQuizPercentage || 0, range],
      ["Astro AI Conversations", metrics.aiConversations || 0, range],
      ["OCR Completed Pages", metrics.ocrCompleted || 0, range],
      ["OCR Failed Pages", metrics.ocrFailed || 0, range],
      ["OCR Success Rate", metrics.ocrThroughputRate || "100%", range],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gurukul_analytics_${range}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Platform Analytics</h1>
          <p className="text-xs text-stone-500 mt-1">
            Aggregate engagement, reading throughput, quiz completions, and OCR efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Range Selector */}
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 border border-stone-300 text-xs font-semibold">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "all", label: "Past Year" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => fetchRange(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  range === tab.id
                    ? "bg-white text-stone-900 font-bold shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            title="Download CSV Report"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">New Registrations</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black font-serif text-stone-900">+{metrics.newUsers || 0}</p>
          <p className="text-[10px] text-stone-400 mt-1">Total: {metrics.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Reading Sessions</span>
            <BookOpen className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-black font-serif text-stone-900">{metrics.readingCount || 0}</p>
          <p className="text-[10px] text-stone-400 mt-1">Chapters & Verses studied</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quiz Attempts</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black font-serif text-stone-900">{metrics.quizAttempts || 0}</p>
          <p className="text-[10px] text-stone-400 mt-1">Avg Score: {metrics.averageQuizPercentage || 0}%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Astro AI Volume</span>
            <Bot className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-2xl font-black font-serif text-stone-900">{metrics.aiConversations || 0}</p>
          <p className="text-[10px] text-stone-400 mt-1">Discussions initiated</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">OCR Success Rate</span>
            <ScanText className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black font-serif text-stone-900">{metrics.ocrThroughputRate || "100%"}</p>
          <p className="text-[10px] text-stone-400 mt-1">{metrics.ocrCompleted || 0} completed, {metrics.ocrFailed || 0} failed</p>
        </div>
      </div>

      {/* Visual Activity Bars */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#d4a359]" />
          <span>Timeline Engagement Activity</span>
        </h2>
        <p className="text-xs text-stone-500">Daily distribution of user activity and readings over the selected window.</p>

        <div className="pt-4 grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-48 border-b border-stone-100">
          {timeline.map((point, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full max-w-[20px] bg-gradient-to-t from-[#13382c] to-[#24634f] rounded-t-md transition-all hover:brightness-125" style={{ height: `${Math.max(15, Math.min(100, (point.reads + point.quizzes + 5) * 6))}%` }} />
              <span className="text-[9px] text-stone-400 font-mono rotate-45 sm:rotate-0 mt-1 truncate">{point.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Definitions & Methodology */}
      <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-5 text-xs text-stone-600 space-y-2">
        <h3 className="font-bold text-stone-900 flex items-center gap-1.5 font-serif text-sm">
          <Info className="w-4 h-4 text-amber-700" />
          <span>Metric Methodology & Definitions</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-500">
          <li><strong>New Registrations:</strong> Count of verified user records created inside the specified window.</li>
          <li><strong>Reading Sessions:</strong> Distinct chapter reading progress milestones updated in PostgreSQL.</li>
          <li><strong>Quiz Attempts:</strong> Total interactive quizzes submitted by users with automated score evaluations.</li>
          <li><strong>OCR Success Rate:</strong> Ratio of completed high-accuracy OCR book pages versus failed renders.</li>
        </ul>
      </div>
    </div>
  );
}
