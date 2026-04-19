import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mail, Lock, Loader2, Code2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") === "company" ? "company" : "candidate") as
    | "candidate"
    | "company";
  const [role, setRole] = useState<"candidate" | "company">(initialRole);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("role", role);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const destination = role === "company" ? "/company" : "/candidate";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
            emailRedirectTo: `${window.location.origin}${destination}`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        navigate(destination);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(destination);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            find<span className="text-primary">em</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-elevated p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all",
                  role === "candidate"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                Developer
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all",
                  role === "company"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Building2 className="h-3.5 w-3.5" />
                Company
              </button>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">{role === "company" ? "Company Name" : "Full Name"}</Label>
                <Input id="name" placeholder={role === "company" ? "Acme Inc." : "Your name"} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
