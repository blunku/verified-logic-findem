import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/candidate", label: "Candidates" },
  { to: "/company", label: "Companies" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          find<span className="text-primary">em</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Button
                key={item.to}
                variant="ghost"
                size="sm"
                asChild
                className={cn(active && "text-primary bg-primary/10")}
              >
                <Link to={item.to}>{item.label}</Link>
              </Button>
            );
          })}
          {authed ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-2">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          ) : (
            <Button variant="default" size="sm" asChild className="ml-2">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
