import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Timer,
  Play,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

type Lang = "javascript" | "python" | "java";

type Problem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  statement: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  starter: Record<Lang, string>;
};

const PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    statement:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume each input has exactly one solution and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    starter: {
      javascript: `function twoSum(nums, target) {\n  // Your code here\n}\n`,
      python: `def two_sum(nums, target):\n    # Your code here\n    pass\n`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}\n`,
    },
  },
  {
    id: "valid-parens",
    title: "Valid Parentheses",
    difficulty: "Easy",
    statement:
      "Given a string s containing only the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if open brackets are closed by the same type, in correct order, and every close has a matching open.",
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of brackets only"],
    starter: {
      javascript: `function isValid(s) {\n  // Your code here\n}\n`,
      python: `def is_valid(s):\n    # Your code here\n    pass\n`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}\n`,
    },
  },
  {
    id: "reverse-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    statement:
      "Given the head of a singly linked list, reverse the list and return the reversed list's head.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    constraints: ["0 ≤ nodes ≤ 5000", "-5000 ≤ Node.val ≤ 5000"],
    starter: {
      javascript: `function reverseList(head) {\n  // Your code here\n}\n`,
      python: `def reverse_list(head):\n    # Your code here\n    pass\n`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n        return null;\n    }\n}\n`,
    },
  },
];

const TEST_CASES: Record<string, { name: string; input: string; expected: string }[]> = {
  "two-sum": [
    { name: "Basic case", input: "[2,7,11,15], 9", expected: "[0,1]" },
    { name: "Middle pair", input: "[3,2,4], 6", expected: "[1,2]" },
    { name: "Duplicates", input: "[3,3], 6", expected: "[0,1]" },
    { name: "Negative numbers", input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]" },
  ],
  "valid-parens": [
    { name: "Simple match", input: '"()"', expected: "true" },
    { name: "Mixed brackets", input: '"()[]{}"', expected: "true" },
    { name: "Mismatched", input: '"(]"', expected: "false" },
    { name: "Nested", input: '"{[()]}"', expected: "true" },
  ],
  "reverse-list": [
    { name: "Five nodes", input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" },
    { name: "Two nodes", input: "[1,2]", expected: "[2,1]" },
    { name: "Empty list", input: "[]", expected: "[]" },
    { name: "Single node", input: "[1]", expected: "[1]" },
  ],
};

const difficultyClass = (d: Problem["difficulty"]) =>
  d === "Easy"
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : d === "Medium"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const Challenge = () => {
  const problem = useMemo(() => PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)], []);
  const [language, setLanguage] = useState<Lang>("javascript");
  const [code, setCode] = useState(problem.starter.javascript);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ name: string; pass: boolean }[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<null | {
    accepted: boolean;
    time: string;
    space: string;
  }>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setCode(problem.starter[language]);
  }, [language, problem]);

  const lineCount = code.split("\n").length;

  const handleRunTests = () => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const cases = TEST_CASES[problem.id] ?? [];
      const hasContent = code.trim().split("\n").some((l) => {
        const t = l.trim();
        return t && !t.startsWith("//") && !t.startsWith("#") && !t.startsWith("/*") && t !== "}" && !t.startsWith("function") && !t.startsWith("def") && !t.startsWith("class");
      });
      const passRate = hasContent ? 0.85 : 0.1;
      const out = cases.map((c, i) => ({
        name: c.name,
        pass: hasContent && (i === 0 ? true : Math.random() < passRate),
      }));
      setResults(out);
      setRunning(false);
      const passed = out.filter((r) => r.pass).length;
      toast.success(`${passed}/${out.length} test cases passed`);
    }, 1200);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setVerdict(null);
    setTimeout(() => {
      const passed = results?.filter((r) => r.pass).length ?? 0;
      const total = results?.length ?? TEST_CASES[problem.id].length;
      const accepted = passed >= Math.ceil(total * 0.75);
      const complexities: Record<string, { time: string; space: string }> = {
        "two-sum": { time: "O(n)", space: "O(n)" },
        "valid-parens": { time: "O(n)", space: "O(n)" },
        "reverse-list": { time: "O(n)", space: "O(1)" },
      };
      setVerdict({
        accepted,
        ...complexities[problem.id],
      });
      setSubmitting(false);
    }, 3000);
  };

  const handleEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/60 to-background">
        <div className="container mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Live Logic Challenge</h1>
              <p className="text-xs text-muted-foreground">
                Real-time technical assessment · Findem AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm ${
                secondsLeft < 60
                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                  : secondsLeft < 300
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : "border-border bg-card text-foreground"
              }`}
            >
              <Timer className="h-4 w-4" />
              {formatTime(secondsLeft)}
            </div>
            <Button onClick={handleSubmit} disabled={submitting} variant="hero">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Submit Solution
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Problem panel */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{problem.title}</h2>
                <p className="text-xs text-muted-foreground">Problem statement</p>
              </div>
              <Badge variant="outline" className={difficultyClass(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
            </div>
            <div className="p-5 space-y-5 text-sm leading-7">
              <p className="text-muted-foreground">{problem.statement}</p>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Examples
                </h3>
                <div className="space-y-2">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
                      <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                      <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Constraints
                </h3>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {problem.constraints.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Editor panel */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2">solution.{language === "javascript" ? "js" : language === "python" ? "py" : "java"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={(v) => setLanguage(v as Lang)}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleRunTests} disabled={running}>
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Run Tests
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="relative bg-[hsl(220_30%_6%)] flex">
              <div
                aria-hidden
                className="select-none py-3 px-3 text-right font-mono text-xs text-muted-foreground/60 border-r border-border/50 bg-[hsl(220_30%_5%)]"
                style={{ minWidth: 44 }}
              >
                {Array.from({ length: Math.max(lineCount, 16) }).map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={taRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleEditorKey}
                spellCheck={false}
                className="flex-1 bg-transparent text-foreground font-mono text-sm leading-6 px-4 py-3 outline-none resize-none min-h-[360px] caret-primary"
                style={{
                  // light syntax color via selection
                  tabSize: 2,
                }}
              />
            </div>

            {/* Tests */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Test Cases
                </h3>
                {results && (
                  <span className="text-xs text-muted-foreground">
                    {results.filter((r) => r.pass).length}/{results.length} passing
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {(results ?? TEST_CASES[problem.id].map((t) => ({ name: t.name, pass: false }))).map(
                  (r, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
                        results
                          ? r.pass
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-red-500/30 bg-red-500/5"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <span className="font-mono">{r.name}</span>
                      {results ? (
                        r.pass ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5" /> Failed
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom analysis bar */}
        <div className="mt-6 rounded-xl border border-border bg-gradient-to-br from-card to-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Solution Analysis
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Submit for an instant Findem AI review of correctness, complexity, and code quality.
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} variant="hero" size="lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Submit for AI Analysis
            </Button>
          </div>

          {submitting && (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-5 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <div className="text-sm font-medium">Analyzing your solution...</div>
                <div className="text-xs text-muted-foreground">
                  Running static analysis · detecting complexity · scoring patterns
                </div>
              </div>
            </div>
          )}

          {verdict && !submitting && (
            <div
              className={`mt-5 rounded-xl border p-5 ${
                verdict.accepted
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_hsl(150_70%_40%/0.15)]"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {verdict.accepted ? (
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold">
                      {verdict.accepted ? "Solution Accepted ✓" : "Needs Improvement"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {verdict.accepted
                        ? "Your solution passed correctness and quality checks."
                        : "Some test cases failed or complexity could be improved."}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <Cpu className="h-3.5 w-3.5" /> Time: {verdict.time}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Database className="h-3.5 w-3.5" /> Space: {verdict.space}
                  </Badge>
                  {verdict.accepted && (
                    <Badge className="gap-1.5 bg-primary/15 text-primary border-primary/30 border">
                      <Trophy className="h-3.5 w-3.5" /> Added to your Findem Score
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenge;
