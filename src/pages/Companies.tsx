import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Quote,
  Filter,
  Sparkles,
} from "lucide-react";

type Company = {
  name: string;
  industry: string;
  trust: number;
  hires: number;
  avgSalary: number;
  review: string;
  reviewer: string;
};

const COMPANIES: Company[] = [
  {
    name: "Vercel",
    industry: "Developer Tools",
    trust: 9.2,
    hires: 45,
    avgSalary: 165000,
    review: "Fast interview loop, great engineering culture, and the team genuinely cares about DX.",
    reviewer: "Senior Frontend Engineer",
  },
  {
    name: "Anthropic",
    industry: "AI / ML",
    trust: 9.8,
    hires: 23,
    avgSalary: 245000,
    review: "Most thoughtful hiring process I've seen. Real technical depth and high trust from day one.",
    reviewer: "Research Engineer",
  },
  {
    name: "Linear",
    industry: "Productivity",
    trust: 8.9,
    hires: 67,
    avgSalary: 155000,
    review: "Calm, focused engineering org. Quality bar is extremely high without burnout culture.",
    reviewer: "Full Stack Engineer",
  },
  {
    name: "Stripe",
    industry: "Fintech",
    trust: 9.5,
    hires: 89,
    avgSalary: 195000,
    review: "World-class infrastructure team. Compensation and growth opportunities are genuinely top-tier.",
    reviewer: "Infrastructure Engineer",
  },
  {
    name: "Notion",
    industry: "Productivity",
    trust: 8.7,
    hires: 34,
    avgSalary: 145000,
    review: "Mission-driven team with strong product taste. Engineering autonomy is real here.",
    reviewer: "Product Engineer",
  },
  {
    name: "OpenAI",
    industry: "AI / ML",
    trust: 9.6,
    hires: 28,
    avgSalary: 260000,
    review: "Frontier work, brilliant peers. Pace is intense but the impact is unmatched.",
    reviewer: "ML Engineer",
  },
];

const INDUSTRIES = ["All", "AI / ML", "Developer Tools", "Productivity", "Fintech"];

const Companies = () => {
  const [industry, setIndustry] = useState("All");
  const [minTrust, setMinTrust] = useState("0");
  const [salary, setSalary] = useState("0");

  const filtered = useMemo(() => {
    return COMPANIES.filter((c) => {
      if (industry !== "All" && c.industry !== industry) return false;
      if (c.trust < Number(minTrust)) return false;
      if (c.avgSalary < Number(salary)) return false;
      return true;
    });
  }, [industry, minTrust, salary]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified by Findem
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Verified Companies</h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Companies vetted by Findem. Real reviews from hired candidates.
          </p>
        </header>

        {/* Filters */}
        <Card className="bg-card/40 border-border/60 mb-8">
          <CardContent className="p-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold mr-2">
              <Filter className="h-4 w-4 text-primary" /> Filters
            </div>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-44 h-10 bg-background/60">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={minTrust} onValueChange={setMinTrust}>
              <SelectTrigger className="w-44 h-10 bg-background/60">
                <SelectValue placeholder="Trust Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any trust score</SelectItem>
                <SelectItem value="8">8.0+</SelectItem>
                <SelectItem value="9">9.0+</SelectItem>
                <SelectItem value="9.5">9.5+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salary} onValueChange={setSalary}>
              <SelectTrigger className="w-44 h-10 bg-background/60">
                <SelectValue placeholder="Salary range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any salary</SelectItem>
                <SelectItem value="120000">$120k+</SelectItem>
                <SelectItem value="160000">$160k+</SelectItem>
                <SelectItem value="200000">$200k+</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} of {COMPANIES.length} companies
            </span>
          </CardContent>
        </Card>

        {/* Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CompanyCard key={c.name} company={c} />
          ))}
        </section>

        {filtered.length === 0 && (
          <Card className="bg-card/40 border-border/60 mt-6">
            <CardContent className="p-12 text-center text-muted-foreground">
              No companies match your filters.
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <section className="mt-14">
          <Card className="bg-gradient-to-br from-primary/15 via-card/40 to-card/20 border-primary/30 overflow-hidden">
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-2">
                  <Sparkles className="h-3.5 w-3.5" /> For employers
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Is your company on Findem?
                </h2>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Get verified, hire pre-audited engineers, and build a public trust score from real candidate reviews.
                </p>
              </div>
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth">
                  Get Verified <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const CompanyCard = ({ company }: { company: Company }) => {
  const initials = company.name.slice(0, 2).toUpperCase();
  return (
    <Card className="group bg-card/40 border-border/60 hover:border-primary/40 transition-all duration-300 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight">{company.name}</h3>
            <Badge variant="outline" className="mt-1 text-[10px] font-medium border-border/60 text-muted-foreground">
              <Building2 className="h-3 w-3 mr-1" />
              {company.industry}
            </Badge>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
            <Star className="h-3 w-3 fill-current" />
            {company.trust.toFixed(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/60">
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              <Users className="h-3 w-3" /> Hires via Findem
            </div>
            <div className="font-bold">{company.hires}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" /> Avg salary
            </div>
            <div className="font-bold">${(company.avgSalary / 1000).toFixed(0)}k</div>
          </div>
        </div>

        <div className="relative">
          <Quote className="h-4 w-4 text-primary/40 absolute -top-1 -left-1" />
          <p className="text-sm text-muted-foreground italic pl-5 leading-relaxed">
            "{company.review}"
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-2 pl-5">
            — {company.reviewer}, hired via Findem
          </p>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <Link to="/jobs">
            View Jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Companies;
