import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Github,
  Linkedin,
  ShieldCheck,
  Sparkles,
  Save,
  X,
  Plus,
  ArrowRight,
  Loader2,
  Mail,
  KeyRound,
  Trash2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Candidate = {
  id: string;
  user_id: string;
  full_name: string | null;
  title: string | null;
  location: string | null;
  email: string | null;
  github_username: string | null;
  github_url: string | null;
  status: string;
  about: string | null;
  linkedin_url: string | null;
  skills: string[] | null;
  years_experience: number | null;
};

type Audit = {
  id: string;
  created_at: string;
  audit_status: string;
  overall_score: number | null;
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);

  // Editable form state
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Settings tab state
  const [newEmail, setNewEmail] = useState("");
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: cand, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        toast({ title: "Failed to load profile", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (cand) {
        setCandidate(cand as Candidate);
        setFullName(cand.full_name ?? "");
        setTitle(cand.title ?? "");
        setLocation(cand.location ?? "");
        setAbout(cand.about ?? "");
        setGithubUrl(cand.github_url ?? "");
        setLinkedinUrl(cand.linkedin_url ?? "");
        setYearsExperience(cand.years_experience?.toString() ?? "");
        setSkills(cand.skills ?? []);

        const { data: auditRows } = await supabase
          .from("audit_results")
          .select("id, created_at, audit_status, overall_score")
          .eq("candidate_id", cand.id)
          .order("created_at", { ascending: false });
        setAudits((auditRows as Audit[]) ?? []);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const initials = useMemo(() => {
    const name = fullName.trim() || candidate?.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [fullName, candidate?.email]);

  const latestAudit = audits.find((a) => a.audit_status === "complete") ?? audits[0];
  const overallScore = latestAudit?.overall_score ?? null;
  const isVerified = candidate?.status === "verified" || !!latestAudit?.overall_score;

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || skills.includes(s)) return;
    if (s.length > 40) return;
    setSkills([...skills, s]);
    setNewSkill("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleSave = async () => {
    if (!candidate) return;
    setSaving(true);

    const years = yearsExperience ? parseInt(yearsExperience, 10) : null;

    const { error } = await supabase
      .from("candidates")
      .update({
        full_name: fullName.trim() || null,
        title: title.trim() || null,
        location: location.trim() || null,
        about: about.trim() || null,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        skills,
        years_experience: Number.isFinite(years as number) ? years : null,
      })
      .eq("user_id", candidate.user_id);

    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile saved", description: "Your changes have been updated." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading profile...
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">
          No candidate profile found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-20 max-w-5xl mx-auto px-6">
        {/* Header card */}
        <Card className="surface-elevated overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
          <CardContent className="p-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground border-4 border-card shadow-lg">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {fullName || "Unnamed Candidate"}
                  </h1>
                  {isVerified && (
                    <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/20">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified Expert
                    </Badge>
                  )}
                  {overallScore !== null && (
                    <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                      <Sparkles className="h-3 w-3 mr-1" /> Findem Score: {overallScore}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{title || "Add your title"}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {location || "Location not set"}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} variant="hero">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="mt-8">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="audits">My Audits</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card className="surface-card">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Basic info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full name">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Title / Role">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Senior Full-Stack Engineer" />
                  </Field>
                  <Field label="Location">
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="San Francisco, CA" />
                  </Field>
                  <Field label="Years of experience">
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder="5"
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  About me
                </h2>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="Tell companies about your background, strengths, and what you're looking for..."
                />
                <p className="text-xs text-muted-foreground">{about.length}/1000</p>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="GitHub URL" icon={<Github className="h-3.5 w-3.5" />}>
                    <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                  </Field>
                  <Field label="LinkedIn URL" icon={<Linkedin className="h-3.5 w-3.5" />}>
                    <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 && (
                    <p className="text-xs text-muted-foreground">No skills added yet.</p>
                  )}
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 pl-3 pr-1.5 py-1">
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        className="ml-1 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                        aria-label={`Remove ${s}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    maxLength={40}
                    placeholder="Add a skill (e.g. TypeScript)"
                  />
                  <Button variant="outline" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUDITS TAB */}
          <TabsContent value="audits" className="mt-6">
            <Card className="surface-card">
              <CardContent className="p-6">
                {audits.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-muted-foreground">No audits yet.</p>
                    <Button asChild variant="hero">
                      <Link to="/candidate">Start your first audit <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {audits.map((a) => (
                      <div key={a.id} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Audit #{a.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {" · "}
                            <span className={a.audit_status === "complete" ? "text-success" : "text-warning"}>
                              {a.audit_status}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Overall</p>
                            <p className="text-xl font-bold text-primary font-mono">
                              {a.overall_score ?? "—"}
                            </p>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link to="/report">View Report</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* APPLICATIONS TAB */}
          <TabsContent value="applications" className="mt-6">
            <Card className="surface-card">
              <CardContent className="p-10 text-center space-y-3">
                <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                <Button asChild variant="hero">
                  <Link to="/jobs">Browse Jobs <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="mt-6">
            <Card className="surface-card">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                  <p className="text-sm text-foreground mt-1">{candidate.email ?? "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account status</Label>
                  <p className="text-sm text-foreground mt-1 capitalize">{candidate.status}</p>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                >
                  Sign out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
      {icon}
      {label}
    </Label>
    {children}
  </div>
);

export default Profile;
