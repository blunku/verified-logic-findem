import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { Brain, Code2, Bug, Lightbulb, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const experts = [
  {
    name: "Alex Chen",
    role: "Full-Stack Engineer",
    verified: true,
    overall: 91,
    scores: { decomposition: 94, quality: 89, edgeCases: 88, optimization: 93 },
    languages: ["TypeScript", "Go", "Python"],
    highlight: "Exceptional at breaking down complex distributed systems problems.",
  },
  {
    name: "Maria Santos",
    role: "Backend Engineer",
    verified: true,
    overall: 88,
    scores: { decomposition: 85, quality: 92, edgeCases: 90, optimization: 84 },
    languages: ["Rust", "Python", "Java"],
    highlight: "Strong focus on safety and correctness. Excellent edge-case intuition.",
  },
  {
    name: "Jordan Lee",
    role: "Frontend Engineer",
    verified: true,
    overall: 85,
    scores: { decomposition: 88, quality: 86, edgeCases: 78, optimization: 87 },
    languages: ["TypeScript", "React", "CSS"],
    highlight: "Creative problem solver with keen eye for performance optimization.",
  },
  {
    name: "Sam Patel",
    role: "ML Engineer",
    verified: true,
    overall: 93,
    scores: { decomposition: 96, quality: 90, edgeCases: 91, optimization: 95 },
    languages: ["Python", "C++", "Julia"],
    highlight: "Top-tier algorithmic thinking. Consistently finds optimal solutions.",
  },
];

const scoreLabels = [
  { key: "decomposition" as const, label: "Decomposition", icon: Brain },
  { key: "quality" as const, label: "Code Quality", icon: Code2 },
  { key: "edgeCases" as const, label: "Edge Cases", icon: Bug },
  { key: "optimization" as const, label: "Optimization", icon: Lightbulb },
];

const CompanyDashboard = () => {
  const [search, setSearch] = useState("");
  const filtered = experts.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.languages.some((l) => l.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">Verified Experts</h1>
              <p className="text-muted-foreground">Browse candidates with AI-verified logic breakdowns.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or language..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((expert) => (
              <div key={expert.name} className="surface-elevated p-6 hover:border-primary/20 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Profile */}
                  <div className="flex items-center gap-4 lg:w-64 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {expert.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{expert.name}</span>
                        {expert.verified && (
                          <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{expert.role}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {expert.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {scoreLabels.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon className="w-3 h-3" />
                          {label}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={expert.scores[key]} className="h-1.5 flex-1" />
                          <span className="text-xs font-mono font-medium">{expert.scores[key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall */}
                  <div className="flex items-center gap-4 lg:w-32 shrink-0 justify-end">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{expert.overall}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</div>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Highlight */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">"{expert.highlight}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
