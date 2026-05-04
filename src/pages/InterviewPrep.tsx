import { useState, useMemo } from "react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Bot,
  User,
  Loader2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

type Role =
  | "Frontend Engineer"
  | "Backend Engineer"
  | "Full Stack Developer"
  | "Data Scientist"
  | "DevOps Engineer";

const QUESTION_BANK: Record<Role, string[]> = {
  "Frontend Engineer": [
    "Explain the virtual DOM and why React uses it.",
    "What is the difference between useMemo and useCallback?",
    "How does CSS specificity work? Give an example.",
    "Explain event delegation in JavaScript.",
    "What are the key differences between SSR, SSG, and CSR?",
  ],
  "Backend Engineer": [
    "What is database indexing and when should you avoid it?",
    "Explain the difference between SQL and NoSQL with a real use case.",
    "How would you design a rate limiter for an API?",
    "What is the N+1 query problem and how do you fix it?",
    "Explain idempotency and why it matters in API design.",
  ],
  "Full Stack Developer": [
    "Walk me through what happens when a user types a URL and hits enter.",
    "How do you handle authentication across frontend and backend?",
    "Explain optimistic UI updates and their tradeoffs.",
    "How would you architect a real-time chat application?",
    "What is CORS and how do you debug a CORS issue?",
  ],
  "Data Scientist": [
    "Explain the bias-variance tradeoff.",
    "When would you use a random forest vs a gradient boosting model?",
    "How do you handle imbalanced datasets?",
    "What is p-hacking and how do you avoid it?",
    "Explain cross-validation and why we use it.",
  ],
  "DevOps Engineer": [
    "What is the difference between containers and virtual machines?",
    "Explain blue-green vs canary deployments.",
    "How does Kubernetes handle service discovery?",
    "What is infrastructure as code? Tools you've used?",
    "How would you debug a production outage with high CPU on one node?",
  ],
};

type Feedback = {
  clarity_score: number;
  technical_accuracy: number;
  communication_score: number;
  did_well: string[];
  improvements: string[];
};

type HistoryEntry = {
  question: string;
  answer: string;
  feedback: Feedback;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const InterviewPrep = () => {
  const [role, setRole] = useState<Role>("Frontend Engineer");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [addedToReport, setAddedToReport] = useState(false);

  const questions = QUESTION_BANK[role];
  const currentQuestion = questions[questionIdx];

  const readiness = useMemo(() => {
    if (history.length === 0) return 0;
    const totals = history.reduce(
      (acc, h) =>
        acc +
        (h.feedback.clarity_score +
          h.feedback.technical_accuracy +
          h.feedback.communication_score) /
          3,
      0,
    );
    const avg = totals / history.length; // 0–10
    const coverage = Math.min(history.length / 5, 1); // 5 questions = full coverage
    return Math.round(avg * 10 * (0.5 + 0.5 * coverage));
  }, [history]);

  const handleRoleChange = (next: Role) => {
    setRole(next);
    setQuestionIdx(0);
    setAnswer("");
    setFeedback(null);
    setHistory([]);
    setAddedToReport(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error("Write at least a sentence or two before submitting.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/interview-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ role, question: currentQuestion, answer }),
      });
      if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      if (!res.ok) throw new Error("Failed to analyze answer");
      const fb: Feedback = await res.json();
      setFeedback(fb);
      setHistory((h) => [...h, { question: currentQuestion, answer, feedback: fb }]);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
      setAnswer("");
      setFeedback(null);
    } else {
      toast.success("You've completed all questions for this role!");
    }
  };

  const addToReport = () => {
    setAddedToReport(true);
    toast.success("Interview score added to your Findem Report ✓");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Findem Exclusive
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            AI Interview Coach
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice with AI. Ace the real interview.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: simulator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role selector */}
            <div className="rounded-xl border border-border bg-card p-5">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Select your target role
              </label>
              <Select value={role} onValueChange={(v) => handleRoleChange(v as Role)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(QUESTION_BANK).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Question {questionIdx + 1} of {questions.length}
              </div>
            </div>

            {/* Chat-style Q&A */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {/* AI bubble */}
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">AI Coach</div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/50 border border-border p-4 text-sm leading-relaxed">
                    {currentQuestion}
                  </div>
                </div>
              </div>

              {/* User answer */}
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Your answer</div>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here. Be specific and use examples..."
                    className="min-h-[140px] resize-none"
                    disabled={loading}
                  />
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button onClick={submitAnswer} disabled={loading || !answer.trim()}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Submit for AI Feedback
                        </>
                      )}
                    </Button>
                    {feedback && (
                      <Button variant="outline" onClick={nextQuestion}>
                        Next question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className="flex gap-3 pt-2">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="text-xs text-muted-foreground">AI Feedback</div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Clarity", value: feedback.clarity_score },
                        { label: "Technical", value: feedback.technical_accuracy },
                        { label: "Communication", value: feedback.communication_score },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                          <div className="text-2xl font-bold mt-1">
                            {s.value}
                            <span className="text-sm text-muted-foreground">/10</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                        <CheckCircle2 className="h-4 w-4" /> What you did well
                      </div>
                      <ul className="space-y-1.5 text-sm text-foreground/90">
                        {feedback.did_well.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-2">
                        <Lightbulb className="h-4 w-4" /> How to improve
                      </div>
                      <ul className="space-y-1.5 text-sm text-foreground/90">
                        {feedback.improvements.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: progress + actions */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                Interview Readiness
              </div>
              <div className="text-5xl font-bold mb-3">{readiness}%</div>
              <Progress value={readiness} className="h-2" />
              <p className="text-xs text-muted-foreground mt-3">
                Based on {history.length} answered question{history.length === 1 ? "" : "s"}.
                Answer all 5 to unlock full readiness.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-sm font-semibold mb-3">Session summary</div>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No answers yet. Submit your first response to start tracking progress.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const avg =
                      (h.feedback.clarity_score +
                        h.feedback.technical_accuracy +
                        h.feedback.communication_score) /
                      3;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-muted-foreground truncate pr-2">
                          Q{i + 1}
                        </span>
                        <Badge variant="secondary" className="font-mono">
                          {avg.toFixed(1)}/10
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              variant={addedToReport ? "secondary" : "default"}
              onClick={addToReport}
              disabled={history.length === 0 || addedToReport}
            >
              {addedToReport ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Added to Findem Report
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Findem Report
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPrep;
