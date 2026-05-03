import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  DollarSign,
  Filter,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  role: string;
  minRate: number;
  maxRate: number;
  hiredThisMonth: number;
  minScore: number;
  bonus: number;
  remote: boolean;
  location: string;
};

const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    title: "Software Engineer",
    company: "Vercel",
    role: "Engineering",
    minRate: 40,
    maxRate: 80,
    hiredThisMonth: 12,
    minScore: 70,
    bonus: 2000,
    remote: true,
    location: "Remote",
  },
  {
    id: "2",
    title: "AI Training Expert",
    company: "Anthropic",
    role: "AI/ML",
    minRate: 80,
    maxRate: 120,
    hiredThisMonth: 8,
    minScore: 85,
    bonus: 5000,
    remote: true,
    location: "Remote",
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "Linear",
    role: "Engineering",
    minRate: 60,
    maxRate: 100,
    hiredThisMonth: 15,
    minScore: 75,
    bonus: 3000,
    remote: true,
    location: "Remote",
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "Stripe",
    role: "Data",
    minRate: 70,
    maxRate: 110,
    hiredThisMonth: 6,
    minScore: 80,
    bonus: 4000,
    remote: false,
    location: "San Francisco",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "Cloudflare",
    role: "Infrastructure",
    minRate: 55,
    maxRate: 95,
    hiredThisMonth: 9,
    minScore: 72,
    bonus: 2500,
    remote: true,
    location: "Remote",
  },
  {
    id: "6",
    title: "ML Engineer",
    company: "OpenAI",
    role: "AI/ML",
    minRate: 90,
    maxRate: 150,
    hiredThisMonth: 4,
    minScore: 88,
    bonus: 7500,
    remote: false,
    location: "New York",
  },
];

const COMPANY_TRUST: Record<string, number> = {
  Vercel: 9.2,
  Anthropic: 9.8,
  Linear: 8.9,
  Stripe: 9.5,
  Notion: 8.7,
  Cloudflare: 9.0,
  OpenAI: 9.6,
};

const ROLES = ["All", "Engineering", "AI/ML", "Data", "Infrastructure"];

const Jobs = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [minScore, setMinScore] = useState([0]);
  const [salaryRange, setSalaryRange] = useState([0, 200]);
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Mock: in a real app this would come from auth/audit state
  const isVerified = false;

  const filtered = useMemo(() => {
    return SAMPLE_JOBS.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
      if (role !== "All" && j.role !== role) return false;
      if (j.minScore < minScore[0]) return false;
      if (j.maxRate < salaryRange[0] || j.minRate > salaryRange[1]) return false;
      if (remoteOnly && !j.remote) return false;
      return true;
    });
  }, [search, role, minScore, salaryRange, remoteOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-20 max-w-7xl mx-auto px-6">
        {/* Top verification banner */}
        <div className="mb-8 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Get verified first to unlock all opportunities
              </p>
              <p className="text-xs text-muted-foreground">
                Verified candidates apply with one click and skip the screening queue.
              </p>
            </div>
          </div>
          <Button asChild variant="hero" size="sm">
            <Link to="/candidate">
              Start Audit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Explore Opportunities
          </h1>
          <p className="mt-2 text-muted-foreground">
            Curated roles from companies hiring verified engineers.
          </p>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by role or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-card"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11 md:w-44 bg-card">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="any">
              <SelectTrigger className="h-11 md:w-44 bg-card">
                <SelectValue placeholder="Salary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any salary</SelectItem>
                <SelectItem value="50">$50+/hr</SelectItem>
                <SelectItem value="80">$80+/hr</SelectItem>
                <SelectItem value="120">$120+/hr</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-4 h-11 rounded-md border border-input bg-card">
              <span className="text-sm text-muted-foreground">Remote</span>
              <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            </div>
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar filters */}
          <aside className="space-y-6">
            <Card className="surface-card">
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  Filters
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Role type
                  </label>
                  <div className="mt-3 space-y-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                          role === r
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Min Findem Score
                    </label>
                    <span className="text-xs font-mono text-primary">{minScore[0]}</span>
                  </div>
                  <Slider
                    value={minScore}
                    onValueChange={setMinScore}
                    max={100}
                    step={5}
                    className="mt-3"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Salary range
                    </label>
                    <span className="text-xs font-mono text-primary">
                      ${salaryRange[0]}-${salaryRange[1]}/hr
                    </span>
                  </div>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200}
                    step={10}
                    className="mt-3"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <label className="text-sm text-foreground">Remote only</label>
                  <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Job grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filtered.length}</span> of {SAMPLE_JOBS.length} roles
              </p>
            </div>

            {filtered.length === 0 ? (
              <Card className="surface-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  No jobs match your filters.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} isVerified={isVerified} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const JobCard = ({ job, isVerified }: { job: Job; isVerified: boolean }) => {
  const trust = COMPANY_TRUST[job.company] ?? 8.5;
  return (
    <Card className="group relative overflow-hidden surface-card hover:border-primary/40 transition-all duration-300 hover:shadow-glow">
      <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg bg-gradient-to-l from-primary/20 to-primary/5 border-l border-b border-primary/20">
        <span className="text-xs font-semibold text-primary flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          ${job.bonus.toLocaleString()} bonus
        </span>
      </div>

      <CardContent className="p-6 pt-7 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground leading-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{job.company}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
            <ShieldCheck className="h-3 w-3" />
            {trust.toFixed(1)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="font-mono font-semibold text-foreground">
            ${job.minRate}-${job.maxRate}
          </span>
          <span className="text-muted-foreground">/hour</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-success" />
            {job.hiredThisMonth} hired this month
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Min Score: {job.minScore}
          </Badge>

          {isVerified ? (
            <Button size="sm" variant="default">
              Apply <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link to="/candidate">Verify to apply</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Jobs;
