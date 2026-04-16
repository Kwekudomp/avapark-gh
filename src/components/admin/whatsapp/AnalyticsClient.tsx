"use client";

import { ArrowLeft, BarChart3, MessageSquare, Bot, Users, Clock } from "lucide-react";

interface AnalyticsData {
  totalMessages: number;
  autoHandled: number;
  escalated: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
  languageBreakdown: Array<{ language: string; count: number }>;
  dailyCounts: Array<{ date: string; count: number }>;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", tw: "Twi", ee: "Ewe", ga: "Ga", fr: "French", pid: "Pidgin",
};

function StatCard({ icon: Icon, label, value, subtext }: {
  icon: typeof MessageSquare;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const autoRate = data.totalMessages > 0
    ? Math.round((data.autoHandled / data.totalMessages) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/admin/whatsapp/inbox" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h1 className="font-semibold text-lg">Analytics</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={MessageSquare} label="Total Messages" value={data.totalMessages} subtext="Last 30 days" />
          <StatCard icon={Bot} label="Auto-handled" value={`${autoRate}%`} subtext={`${data.autoHandled} messages`} />
          <StatCard icon={Users} label="Escalated" value={data.escalated} subtext="Required human reply" />
          <StatCard icon={Clock} label="Avg Response" value={`${data.avgResponseTime}s`} subtext="AI auto-replies" />
        </div>

        <section className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-sm mb-3">Top FAQ Categories</h2>
          <div className="space-y-2">
            {data.topCategories.slice(0, 8).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (data.topCategories[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{cat.count}</span>
                </div>
              </div>
            ))}
            {data.topCategories.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-sm mb-3">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {data.languageBreakdown.map((lang) => (
              <div key={lang.language} className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium">{LANGUAGE_LABELS[lang.language] ?? lang.language}</span>
                <span className="text-gray-400 ml-1">({lang.count})</span>
              </div>
            ))}
            {data.languageBreakdown.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
