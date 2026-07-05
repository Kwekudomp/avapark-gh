"use client";

import { MessageSquare, Bot, Users, Clock } from "lucide-react";
import WhatsAppTabs from "./WhatsAppTabs";

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
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" aria-hidden />
        <span className="text-xs text-text-secondary font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-dark">{value}</p>
      {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
    </div>
  );
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const autoRate = data.totalMessages > 0
    ? Math.round((data.autoHandled / data.totalMessages) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-dark">Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          How the AI agent has performed over the last 30 days.
        </p>
      </div>

      <WhatsAppTabs />

      <div className="space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={MessageSquare} label="Total Messages" value={data.totalMessages} subtext="Last 30 days" />
          <StatCard icon={Bot} label="Auto-handled" value={`${autoRate}%`} subtext={`${data.autoHandled} messages`} />
          <StatCard icon={Users} label="Escalated" value={data.escalated} subtext="Required human reply" />
          <StatCard icon={Clock} label="Avg Response" value={`${data.avgResponseTime}s`} subtext="AI auto-replies" />
        </div>

        <section className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm text-dark mb-3">Top FAQ Categories</h2>
          <div className="space-y-2">
            {data.topCategories.slice(0, 8).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-bg-alt rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (data.topCategories[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-8 text-right">{cat.count}</span>
                </div>
              </div>
            ))}
            {data.topCategories.length === 0 && (
              <p className="text-sm text-text-secondary">No data yet</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm text-dark mb-3">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {data.languageBreakdown.map((lang) => (
              <div key={lang.language} className="px-3 py-1.5 bg-bg-alt rounded-xl text-sm">
                <span className="font-medium text-dark">{LANGUAGE_LABELS[lang.language] ?? lang.language}</span>
                <span className="text-text-secondary ml-1">({lang.count})</span>
              </div>
            ))}
            {data.languageBreakdown.length === 0 && (
              <p className="text-sm text-text-secondary">No data yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
