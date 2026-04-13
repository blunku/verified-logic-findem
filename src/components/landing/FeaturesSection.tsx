import { Brain, GitBranch, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Live AI Code Audit",
    description: "Candidates solve real problems while our AI analyzes their reasoning patterns, not just correctness.",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description: "Link repositories and let our engine assess code quality, architecture decisions, and contribution patterns.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Every candidate gets a verified logic score — cryptographically signed, tamper-proof, and transparent.",
  },
  {
    icon: BarChart3,
    title: "Logic Breakdown",
    description: "Companies see how candidates think: problem decomposition, edge case handling, optimization instincts.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Beyond the resume
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A recruitment engine built on proof, not promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="surface-elevated p-8 group hover:border-primary/20 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
