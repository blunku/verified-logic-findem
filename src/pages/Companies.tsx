import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Sparkles,
  Building2,
  CheckCircle2,
  Rocket,
  Users,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const Companies = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "",
    website: "",
    industry: "",
    size: "",
    contactName: "",
    contactEmail: "",
    hiringNeeds: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.contactEmail) {
      toast.error("Please add at least your company name and email.");
      return;
    }
    setSubmitted(true);
    toast.success("You're on the list! We'll be in touch shortly.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Founding Partner Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Be among our first verified companies
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Findem is curating a launch cohort of companies hiring pre-audited engineers.
            Reserve your spot and get founding-partner pricing for life.
          </p>
        </header>

        {/* Benefits */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: ShieldCheck,
              title: "Verified talent only",
              desc: "Every candidate is technically audited before they reach you.",
            },
            {
              icon: Rocket,
              title: "Founding-partner pricing",
              desc: "Locked-in launch rates and priority access to new features.",
            },
            {
              icon: Star,
              title: "Build your trust score",
              desc: "Real reviews from hired candidates power your public profile.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card/40 border-border/60">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Form */}
        <Card className="bg-gradient-to-br from-primary/10 via-card/40 to-card/20 border-primary/30 overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">List Your Company</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us about your hiring needs. We'll reach out within 48 hours.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">You're on the founding list</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Thanks, {form.contactName || form.company}. We'll email{" "}
                  <span className="text-foreground font-medium">{form.contactEmail}</span>{" "}
                  with next steps shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="company">Company name *</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Acme Inc."
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://acme.com"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI / ML">AI / ML</SelectItem>
                      <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Team size</Label>
                  <Select value={form.size} onValueChange={(v) => update("size", v)}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1–10</SelectItem>
                      <SelectItem value="11-50">11–50</SelectItem>
                      <SelectItem value="51-200">51–200</SelectItem>
                      <SelectItem value="201-1000">201–1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Your name</Label>
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Work email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => update("contactEmail", e.target.value)}
                    placeholder="jane@acme.com"
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="needs">What roles are you hiring for?</Label>
                  <Textarea
                    id="needs"
                    value={form.hiringNeeds}
                    onChange={(e) => update("hiringNeeds", e.target.value)}
                    placeholder="e.g. 3 senior full-stack engineers, 1 ML engineer, remote-first…"
                    className="bg-background/60 min-h-[100px]"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Limited founding spots available.
                  </p>
                  <Button type="submit" size="lg" className="gap-2">
                    Reserve our spot
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Companies;
