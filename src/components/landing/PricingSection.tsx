import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tier = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Free",
    tagline: "Try Before You Trust",
    price: "$0",
    period: "/month",
    features: ["3 candidate audits", "Basic score card"],
    cta: "Start Free",
  },
  {
    name: "Startup",
    tagline: "For Growing Teams",
    price: "$99",
    period: "/month",
    features: [
      "50 audits / month",
      "Full score breakdown",
      "GPT summary report",
      "Email support",
    ],
    cta: "Start Trial",
  },
  {
    name: "Scale",
    tagline: "For Serious Hiring",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited audits",
      "Full audit reports",
      "API access",
      "Priority support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pay Per Hire",
    tagline: "Zero Risk Hiring",
    price: "$999",
    period: "per hire",
    features: [
      "Pay only when you hire",
      "Full forensic audit report",
      "Candidate verification certificate",
      "Dedicated account manager",
    ],
    cta: "Contact Us",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(800px circle at 50% 0%, hsl(217 91% 60% / 0.08), transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-5">
            <Sparkles className="w-3 h-3 text-primary" />
            Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Verified hiring,{" "}
            <span className="text-gradient">priced for reality</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Transparent tiers. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 transition-all duration-300",
                tier.popular
                  ? "border-primary/40 bg-card shadow-[0_0_40px_hsl(217_91%_60%/0.15)] lg:scale-[1.03]"
                  : "border-border bg-card/60 hover:border-border/80 hover:bg-card",
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-[0_0_20px_hsl(217_91%_60%/0.4)]">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  {tier.name}
                </div>
                <h3 className="text-lg font-medium text-foreground mb-4">
                  {tier.tagline}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border mb-6" />

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-foreground/90"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        tier.popular
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-foreground/70",
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? "hero" : "hero-outline"}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative rounded-2xl border border-border bg-card/60 px-8 py-7 text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, hsl(217 91% 60% / 0.06), transparent 70%)",
              }}
            />
            <p className="relative text-base md:text-lg text-foreground/90 leading-relaxed">
              <span className="text-muted-foreground">Mercor charges</span>{" "}
              <span className="font-semibold text-foreground">$15,000+</span>{" "}
              <span className="text-muted-foreground">per hire. Findem charges</span>{" "}
              <span className="font-semibold text-gradient">$999</span>.{" "}
              <span className="text-muted-foreground">Same quality.</span>{" "}
              <span className="font-semibold text-foreground">15× cheaper.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
