import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, LogOut, User, ChevronDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/jobs", label: "Jobs" },
  { to: "/candidate", label: "Candidates" },
  { to: "/company", label: "Companies" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const loadName = async (userId: string, fallback: string) => {
      const { data } = await supabase
        .from("candidates")
        .select("full_name")
        .eq("user_id", userId)
        .maybeSingle();
      setDisplayName(data?.full_name || fallback);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (session?.user) {
        const fallback = session.user.email?.split("@")[0] ?? "Account";
        // Defer DB call to avoid potential auth callback deadlocks
        setTimeout(() => loadName(session.user.id, fallback), 0);
      } else {
        setDisplayName("");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      if (session?.user) {
        const fallback = session.user.email?.split("@")[0] ?? "Account";
        loadName(session.user.id, fallback);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const profileActive = location.pathname === "/profile";

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
            <>
              <Link
                to="/profile"
                className={cn(
                  "ml-2 flex items-center gap-2 px-2.5 h-8 rounded-md border border-border/60 bg-card/40 hover:bg-primary/10 hover:border-primary/40 transition-colors",
                  profileActive && "border-primary/50 bg-primary/10"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-[10px] font-bold text-primary-foreground">
                  {(displayName || "U").charAt(0).toUpperCase()}
                </span>
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                  {displayName || "Profile"}
                </span>
                <User className="h-3 w-3 text-muted-foreground" />
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-1">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </>
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
