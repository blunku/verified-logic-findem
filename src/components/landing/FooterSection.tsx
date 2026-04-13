const FooterSection = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-lg font-bold tracking-tight">
          find<span className="text-primary">em</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} findem. Hire verified logic.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
