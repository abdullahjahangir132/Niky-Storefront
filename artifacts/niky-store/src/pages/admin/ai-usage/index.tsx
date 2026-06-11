import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Zap, TrendingUp, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

type UsageLog = {
  id: number;
  provider: string;
  model: string;
  sessionId: string;
  userMessage: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  createdAt: string;
};

type Summary = {
  totalRequests: number | string;
  totalTokensIn: number | string;
  totalTokensOut: number | string;
  totalTokens: number | string;
};

const PROVIDER_COLORS: Record<string, string> = {
  gemini: "bg-blue-500",
  openai: "bg-emerald-500",
  anthropic: "bg-orange-500",
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic",
};

// Rough cost estimates per 1M tokens (USD)
const COST_PER_M: Record<string, { in: number; out: number }> = {
  gemini:    { in: 0.075, out: 0.30  },
  openai:    { in: 0.15,  out: 0.60  },
  anthropic: { in: 0.25,  out: 1.25  },
};

function estimateCost(provider: string, tokensIn: number, tokensOut: number) {
  const rates = COST_PER_M[provider] ?? { in: 0.15, out: 0.60 };
  return ((tokensIn * rates.in) + (tokensOut * rates.out)) / 1_000_000;
}

export default function AdminAiUsage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-usage", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/ai-usage?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch AI usage");
      return res.json() as Promise<{ logs: UsageLog[]; summary: Summary; page: number; limit: number }>;
    },
  });

  const summary = data?.summary;
  const logs = data?.logs ?? [];

  const totalCost = logs.reduce((acc, l) => acc + estimateCost(l.provider, l.tokensIn, l.tokensOut), 0);
  const totalTokens = Number(summary?.totalTokens ?? 0);
  const totalRequests = Number(summary?.totalRequests ?? 0);

  const kpiCards = [
    {
      label: "Total Requests",
      value: totalRequests.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Tokens Used",
      value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toLocaleString(),
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Tokens In",
      value: Number(summary?.totalTokensIn ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Est. Cost (USD)",
      value: `$${totalCost.toFixed(4)}`,
      icon: Bot,
      color: "text-accent",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-accent" /> AI Usage
        </h1>
        <p className="text-muted-foreground mt-1">Chatbot requests, token usage, and cost estimates</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-black font-display">{isLoading ? "—" : kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cost note */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
        <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">Estimated costs:</span> Gemini 2.0 Flash — very cheap (~$0.075/1M input tokens) | GPT-4o-mini — $0.15/1M input | Claude Haiku — $0.25/1M input. Actual billing depends on your provider account.
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-display uppercase tracking-wider text-lg">Recent Chat Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-secondary animate-pulse rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-bold">No chat requests yet</p>
              <p className="text-sm mt-1">Once customers use the chatbot, usage will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Time</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Provider</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Session</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Message</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Tokens In</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Tokens Out</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleString("en-PK", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${PROVIDER_COLORS[log.provider] || "bg-gray-500"} text-white text-[10px] uppercase tracking-wider`}>
                          {PROVIDER_LABELS[log.provider] || log.provider}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono truncate max-w-[100px]">
                        {log.sessionId?.slice(0, 12) || "anon"}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate text-xs">{log.userMessage || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{log.tokensIn.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{log.tokensOut.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        ${estimateCost(log.provider, log.tokensIn, log.tokensOut).toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Page {page}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={logs.length < 50}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
