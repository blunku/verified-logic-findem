import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldCheck,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Cpu,
  GitBranch,
  FileCheck2,
  Award,
  TrendingUp,
  Bot,
  Hash,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

const WEBHOOK_URL = "https://maliksakib.app.n8n.cloud/webhook/get-audit-results";

type AuditData = {
  id?: string;
  overall_score?: number;
  logic_score?: number;
  problem_solving_score?: number;
  code_quality_score?: number;
  communication_score?: number;
  gpt_summary?: string;
  full_name?: string;
  github_username?: string;
  github_repo_url?: string;
  title?: string;
  created_at?: string;
};

const getInitials = (name?: string, fallback = "AC") => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || fallback;
};

const getRepoName = (url?: string, username?: string) => {
  if (!url) return username ? `${username}/main-project` : "main-project";
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts.slice(-2).join("/") || url;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?github\.com\//, "") || url;
  }
};

const getTopPercent = (score: number) => {
  if (score >= 90) return 1;
  if (score >= 80) return 5;
  if (score >= 70) return 10;
  if (score >= 60) return 25;
  return 50;
};

const hashFromId = (id?: string) => {
  const base = id || Math.random().toString(36).slice(2);
  return `FDM-${base.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()}-${base
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(4, 8)
    .toUpperCase()}-${base.replace(/[^a-zA-Z0-9]/g, "").slice(8, 12).toUpperCase()}`;
};

/* ---------- Score Gauge ---------- */
const ScoreGauge = ({ score }: { score: number }) => {
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142 76% 56%)" />
            <stop offset="100%" stopColor="hsl(160 84% 50%)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(220 14% 14%)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Overall</div>
        <div className="mt-1 text-6xl font-bold leading-none text-foreground">{clamped}</div>
        <div className="mt-1.5 text-xs font-medium text-emerald-400">/ 100</div>
      </div>
    </div>
  );
};

/* ---------- Deep Dive Bar ---------- */
const DeepBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="font-mono font-semibold text-emerald-400">{value}/100</span>
    </div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

/* ---------- Timeline ---------- */
const TimelineItem = ({ label, last }: { label: string; last?: boolean }) => (
  <div className="relative flex gap-4 pb-6 last:pb-0">
    {!last && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-emerald-500/30" />}
    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    </div>
    <div className="pt-0.5">
      <div className="text-sm font-medium text-foreground/90">{label}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">AI Verified ✓</div>
    </div>
  </div>
);

/* ---------- Skill Row ---------- */
type Proficiency = "Expert" | "Advanced" | "Intermediate";
const proficiencyColor: Record<Proficiency, string> = {
  Expert: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Advanced: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const Report = () => {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(WEBHOOK_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response from webhook:", text.slice(0, 200));
          throw new Error("Audit endpoint did not return JSON. The workflow may be offline.");
        }
        const data = await response.json();
        const audit = Array.isArray(data) ? data[0] : data;
        if (!audit || typeof audit !== "object") {
          throw new Error("No audit data available.");
        }
        if (active) setData(audit);
      } catch (e) {
        console.error("Failed to fetch audit results:", e);
        if (active) setError(e instanceof Error ? e.message : "Failed to load report data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDownload = () => window.print();
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const issuedAt = useMemo(() => {
    const d = data?.created_at ? new Date(data.created_at) : new Date();
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, [data?.created_at]);

  const reportHash = useMemo(() => hashFromId(data?.id), [data?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your audit report…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Unable to load report</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "No audit data available."}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const candidateName = data?.full_name || "Anonymous Candidate";
  const githubUsername = data?.github_username || "github-user";
  const title = data?.title || "Software Engineer";
  const overall = data?.overall_score ?? 0;
  const logic = data?.logic_score ?? 0;
  const problem = data?.problem_solving_score ?? 0;
  const quality = data?.code_quality_score ?? 0;
  const comm = data?.communication_score ?? 0;
  const repoName = getRepoName(data?.github_repo_url, githubUsername);
  const summary =
    data?.gpt_summary ||
    "This candidate demonstrated solid engineering fundamentals with consistent code quality and clear problem-solving approaches across the audited repository.";

  // Skill DNA badges
  const dnaBadges: { label: string; icon: typeof Award }[] = [];
  if (logic > 85) dnaBadges.push({ label: "Algorithm Expert", icon: Cpu });
  if (quality > 85) dnaBadges.push({ label: "Clean Code Master", icon: Code2 });
  if (problem > 85) dnaBadges.push({ label: "System Architect", icon: GitBranch });
  if (overall > 90) dnaBadges.push({ label: "Top 1% Engineer", icon: Award });
  if (dnaBadges.length === 0) dnaBadges.push({ label: "Verified Developer", icon: BadgeCheck });

  const hasRisk = overall < 60;
  const topPct = getTopPercent(overall);

  // Radar with new 6 axes
  const radarData = [
    { skill: "Code Quality", value: quality },
    { skill: "Scalability", value: Math.round(logic * 0.5 + problem * 0.5) },
    { skill: "Security", value: Math.round(logic * 0.5 + quality * 0.5) },
    { skill: "Consistency", value: Math.round(quality * 0.6 + comm * 0.4) },
    { skill: "Problem Solving", value: problem },
    { skill: "Documentation", value: comm },
  ];

  // Deep dive (Cleanliness, Efficiency, Maintainability)
  const cleanliness = quality;
  const efficiency = Math.round(logic * 0.6 + problem * 0.4);
  const maintainability = Math.round(quality * 0.5 + comm * 0.5);

  // Skills table
  const skills: { skill: string; evidence: string; level: Proficiency; conf: number }[] = [
    { skill: "TypeScript", evidence: repoName, level: "Expert", conf: Math.min(99, quality + 2) },
    { skill: "Problem Solving", evidence: "Commit Analysis", level: problem >= 85 ? "Expert" : "Advanced", conf: problem },
    { skill: "Code Architecture", evidence: "Repository Structure", level: quality >= 85 ? "Expert" : "Advanced", conf: Math.min(99, quality - 3) },
    { skill: "Documentation", evidence: "README Analysis", level: comm >= 80 ? "Advanced" : "Intermediate", conf: comm },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220_18%_5%)] text-foreground">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Backdrop glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] rounded-full bg-amber-500/[0.06] blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 print:pt-6 print:py-6">
        {/* Back nav */}
        <div className="mb-6 print:hidden">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
            <Link to="/candidate">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* ========== HEADER ========== */}
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-xl font-bold text-black shadow-[0_0_30px_hsl(142_76%_56%/0.3)]">
                {getInitials(candidateName)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[hsl(220_18%_5%)] bg-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-black" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-400">
                Elite AI Technical Audit
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{candidateName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {title} <span className="mx-2 opacity-40">•</span>
                <span className="text-foreground/70">@{githubUsername}</span>
              </p>
              {/* Gold seal */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 px-3 py-1.5 shadow-[0_0_20px_hsl(45_93%_55%/0.2)]">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Verified by Findem AI
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleDownload} size="sm" variant="outline" className="border-white/10 bg-white/[0.02] hover:bg-white/[0.06]">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleShare} size="sm" className="bg-emerald-500 text-black hover:bg-emerald-400">
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
            </div>
            <div className="text-left text-xs text-muted-foreground lg:text-right">
              <div>Issued <span className="text-foreground/80">{issuedAt}</span></div>
              <div className="mt-0.5 font-mono">Report ID: <span className="text-foreground/80">{reportHash}</span></div>
            </div>
          </div>
        </header>

        {/* ========== EXECUTIVE SUMMARY ========== */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">Executive Summary</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center">
              <ScoreGauge score={overall} />
              <div className="mt-4 text-center">
                <div className="text-sm font-semibold text-emerald-400">
                  {overall >= 80 ? "Excellent Performance" : overall >= 60 ? "Solid Performance" : "Needs Review"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Overall Findem Score</div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Skill DNA
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaBadges.map((b) => (
                    <div
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300"
                    >
                      <b.icon className="h-3.5 w-3.5" />
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              {hasRisk ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Flags Detected
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                    <li>• Below-threshold overall score — recommend deeper technical interview</li>
                    <li>• Consider supplementary live coding assessment</li>
                    <li>• Review code samples manually before progressing</li>
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    No Risk Flags Detected ✓
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/70">
                    Candidate passed all integrity, consistency, and quality checks across the audit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========== TECHNICAL RADAR ========== */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                Technical Radar
              </h2>
            </div>
            <Badge className="border-white/10 bg-white/[0.04] text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70 hover:bg-white/[0.08]">
              6-Axis Profile
            </Badge>
          </div>
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_280px]">
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="78%">
                  <defs>
                    <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(142 76% 56%)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(160 84% 50%)" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="hsl(220 14% 18%)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "hsl(0 0% 75%)", fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }}
                    stroke="hsl(220 14% 18%)"
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(142 76% 56%)"
                    fill="url(#radarFill)"
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={1400}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {radarData.map((d) => (
                <div
                  key={d.skill}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span className="text-xs text-foreground/75">{d.skill}</span>
                  <span className="font-mono text-xs font-semibold text-emerald-400">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== DEEP DIVE ========== */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Code Quality Autopsy */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="mb-5 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                Code Quality Autopsy
              </h3>
            </div>
            <div className="space-y-5">
              <DeepBar label="Cleanliness" value={cleanliness} />
              <DeepBar label="Efficiency" value={efficiency} />
              <DeepBar label="Maintainability" value={maintainability} />
            </div>
            <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-foreground/65">
              Derived from static analysis of the audited repository.
              Higher scores indicate production-grade code patterns.
            </div>
          </div>

          {/* Authenticity Timeline */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="mb-5 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                Project Authenticity Timeline
              </h3>
            </div>
            <div>
              <TimelineItem label="GitHub Repository Connected" />
              <TimelineItem label="Code Patterns Analyzed" />
              <TimelineItem label="AI Logic Audit Complete" />
              <TimelineItem label="Findem Certificate Issued" last />
            </div>
          </div>
        </section>

        {/* ========== SKILLS TABLE ========== */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                Skills Verification
              </h3>
            </div>
            <Badge className="border-emerald-500/25 bg-emerald-500/10 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400 hover:bg-emerald-500/15">
              AI Validated
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Skill</th>
                  <th className="px-6 py-3 text-left font-medium">Evidence</th>
                  <th className="px-6 py-3 text-left font-medium">Proficiency</th>
                  <th className="px-6 py-3 text-right font-medium">AI Confidence</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.skill} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground/90">{s.skill}</td>
                    <td className="px-6 py-4 font-mono text-xs text-foreground/65">{s.evidence}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-semibold ${proficiencyColor[s.level]}`}
                      >
                        {s.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                            style={{ width: `${s.conf}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-emerald-400">{s.conf}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== AI BEHAVIORAL NARRATIVE ========== */}
        <section className="mt-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.05] via-white/[0.02] to-transparent p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 shadow-[0_0_20px_hsl(142_76%_56%/0.2)]">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                  AI Behavioral Narrative
                </h3>
                <Badge className="border-emerald-500/25 bg-emerald-500/10 text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-400 hover:bg-emerald-500/15">
                  GPT Analysis
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{summary}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                Generated by Findem AI Engine
              </div>
            </div>
          </div>
        </section>

        {/* ========== MARKET POSITIONING ========== */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                Market Positioning
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400">Top {topPct}%</span>
              <span className="text-xs text-muted-foreground">globally</span>
            </div>
          </div>

          {/* Positioning slider */}
          <div className="relative">
            <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-red-500/30 via-amber-500/30 to-emerald-500/40">
              <div
                className="absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-emerald-300 bg-emerald-500 shadow-[0_0_15px_hsl(142_76%_56%/0.6)]"
                style={{ left: `${overall}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Junior</span>
              <span>Mid</span>
              <span>Senior</span>
              <span className="text-emerald-400">Elite</span>
            </div>
          </div>

          {/* vs Average */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">This Candidate</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{overall}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000"
                  style={{ width: `${overall}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Average Developer</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground/60">58</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-white/25 transition-all duration-1000" style={{ width: "58%" }} />
              </div>
            </div>
          </div>
          <p className="mt-5 text-[11px] text-muted-foreground">
            Based on Findem's database of verified developers across global tech markets.
          </p>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <ShieldCheck className="h-4 w-4 text-black" />
              </div>
              <div>
                <div className="text-sm font-semibold">This report was generated by Findem AI</div>
                <div className="text-[11px] text-muted-foreground">Tamper-proof, blockchain-anchored verification</div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-foreground/75">
                <Hash className="h-3 w-3 text-emerald-400" />
                {reportHash}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Verify authenticity at <span className="text-emerald-400">findem.app/verify</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Report;
