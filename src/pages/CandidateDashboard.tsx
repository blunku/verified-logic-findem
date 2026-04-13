import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { Github, Play, CheckCircle, Clock, Brain, Code2, Bug, Lightbulb } from "lucide-react";
import { useState } from "react";

const auditCategories = [
  { name: "Problem Decomposition", score: 87, icon: Brain, description: "How well you break complex problems into manageable parts" },
  { name: "Code Quality", score: 92, icon: Code2, description: "Clean code, naming conventions, readability" },
  { name: "Edge Case Handling", score: 78, icon: Bug, description: "Anticipating and handling boundary conditions" },
  { name: "Optimization Instinct", score: 85, icon: Lightbulb, description: "Ability to identify and implement efficient solutions" },
];

const CandidateDashboard = () => {
  const [githubLinked, setGithubLinked] = useState(false);
  const [auditStarted, setAuditStarted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Candidate Dashboard</h1>
            <p className="text-muted-foreground">Link your GitHub and prove your logic with a live AI audit.</p>
          </div>

          {/* GitHub Card */}
          <div className="surface-elevated p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Github className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GitHub Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    {githubLinked ? "Connected as @developer" : "Connect your GitHub to analyze your codebase"}
                  </p>
                </div>
              </div>
              <Button
                variant={githubLinked ? "secondary" : "default"}
                onClick={() => setGithubLinked(!githubLinked)}
              >
                {githubLinked ? (
                  <><CheckCircle className="w-4 h-4" /> Connected</>
                ) : (
                  <><Github className="w-4 h-4" /> Link GitHub</>
                )}
              </Button>
            </div>
          </div>

          {/* AI Code Audit */}
          <div className="surface-elevated p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Live AI Code Audit</h3>
                <p className="text-sm text-muted-foreground">
                  Solve a real coding challenge while our AI analyzes your thinking process.
                </p>
              </div>
              <Button
                variant="hero"
                onClick={() => setAuditStarted(!auditStarted)}
                disabled={!githubLinked}
              >
                {auditStarted ? (
                  <><Clock className="w-4 h-4" /> In Progress</>
                ) : (
                  <><Play className="w-4 h-4" /> Start Audit</>
                )}
              </Button>
            </div>

            {!githubLinked && (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">Link your GitHub first to enable the AI Code Audit.</p>
              </div>
            )}

            {auditStarted && githubLinked && (
              <div className="rounded-lg bg-muted/30 border border-primary/10 p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-success text-xs font-medium">AUDIT LIVE</span>
                </div>
                <p className="text-muted-foreground mb-2">// Challenge: Implement a function that finds the longest</p>
                <p className="text-muted-foreground mb-2">// palindromic substring in a given string.</p>
                <p className="text-muted-foreground mb-4">// Optimize for both time and space complexity.</p>
                <div className="border-t border-border pt-4">
                  <p className="text-foreground">function longestPalindrome(s: string): string {"{"}</p>
                  <p className="text-primary pl-4">// Your solution here...</p>
                  <p className="text-foreground">{"}"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {auditStarted && githubLinked && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Logic Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditCategories.map((cat) => (
                  <div key={cat.name} className="surface-card p-5 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <cat.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{cat.name}</span>
                      <Badge variant="secondary" className="ml-auto font-mono text-xs">
                        {cat.score}/100
                      </Badge>
                    </div>
                    <Progress value={cat.score} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
