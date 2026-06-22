import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";

interface AuthPageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <div className="min-h-[calc(100dvh-12rem)] flex flex-col items-center justify-center py-10">
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function AuthFormPanel({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel>
      <SectionHeading title={heading} description={subheading} />
      {children}
    </GlassPanel>
  );
}
