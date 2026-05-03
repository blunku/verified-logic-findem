import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Copy,
  Linkedin,
  Twitter,
  MessageCircle,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Share2,
  UserCheck,
  Briefcase,
  Wallet,
  Link as LinkIcon,
} from "lucide-react";

const Referrals = () => {
  const [username, setUsername] = useState("yourname");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("candidates")
        .select("github_username, full_name, email")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const handle =
        data?.github_username ||
        data?.full_name?.toLowerCase().replace(/\s+/g, "") ||
        session.user.email?.split("@")[0] ||
        "yourname";
      setUsername(handle);
    })();
  }, []);

  const referralLink = `findem.app/ref/${username}`;
  const fullLink = `https://${referralLink}`;
  const shareText = "Join me on Findem — the network where engineers get hired by what they build, not what they write on resumes.";

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullLink);
    toast.success("Referral link copied");
  };

  const shareLinkedIn = () =>
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullLink)}`, "_blank");
  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullLink)}`, "_blank");
  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullLink}`)}`, "_blank");

  const stats = [
    { label: "Total Referrals", value: "0", icon: Users, accent: "text-primary" },
    { label: "Pending Earnings", value: "$0", icon: TrendingUp, accent: "text-amber-400" },
    { label: "Total Earned", value: "$0", icon: DollarSign, accent: "text-emerald-400" },
    { label: "Successful Hires", value: "0", icon: CheckCircle2, accent: "text-primary" },
  ];

  const steps = [
    {
      icon: Share2,
      title: "Share your link",
      desc: "Send your unique referral link to friends, colleagues, or your network.",
    },
    {
      icon: UserCheck,
      title: "They get verified",
      desc: "Once they sign up and pass the AI audit, companies can find them.",
    },
    {
      icon: Briefcase,
      title: "They get hired — you earn",
      desc: "You receive 20% of every successful hire commission. Forever.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <DollarSign className="h-3.5 w-3.5" />
            Referral program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Refer & Earn</h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Earn <span className="text-foreground font-semibold">20% of every hire</span> made through your referral. Forever.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 bg-card/40 border-border/60 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.accent}`} />
              </div>
              <div className="text-2xl font-bold tracking-tight">{s.value}</div>
            </Card>
          ))}
        </section>

        {/* Referral link */}
        <Card className="p-6 mb-10 bg-gradient-to-br from-primary/10 via-card/40 to-card/20 border-primary/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <LinkIcon className="h-4 w-4 text-primary" /> Your unique referral link
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              readOnly
              value={referralLink}
              className="flex-1 font-mono text-sm bg-background/60 border-border/60"
            />
            <Button onClick={copyLink} className="gap-2">
              <Copy className="h-4 w-4" /> Copy Link
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={shareLinkedIn} className="gap-2">
              <Linkedin className="h-4 w-4" /> Share on LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={shareTwitter} className="gap-2">
              <Twitter className="h-4 w-4" /> Share on Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={shareWhatsApp} className="gap-2">
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </Button>
          </div>
        </Card>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <Card key={s.title} className="p-6 bg-card/40 border-border/60 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-5xl font-bold text-primary/10">
                  {i + 1}
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* My Referrals table */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">My Referrals</h2>
          <Card className="bg-card/40 border-border/60 overflow-hidden">
            <div className="grid grid-cols-3 px-5 py-3 border-b border-border/60 bg-background/30 text-xs uppercase tracking-wider text-muted-foreground">
              <div>Name</div>
              <div>Status</div>
              <div className="text-right">Potential Earnings</div>
            </div>
            <div className="px-6 py-12 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No referrals yet. Share your link to start earning.
              </p>
            </div>
          </Card>
        </section>

        {/* Payout */}
        <section>
          <Card className="p-6 bg-card/40 border-border/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Payouts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect a payment method to receive your earnings. Minimum payout: <span className="text-foreground font-medium">$50</span>.
              </p>
            </div>
            <Button className="gap-2">
              <Wallet className="h-4 w-4" /> Connect Payment Method
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Referrals;
