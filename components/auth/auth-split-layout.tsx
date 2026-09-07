import { FileText, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { OmniArchLogo } from "@/components/ui/omniarch-logo";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Transform textual architectural ideas into comprehensive diagrams with intelligent routing.",
  },
  {
    icon: Users,
    title: "Multiplayer Canvas",
    description:
      "Collaborate with teammates simultaneously with live cursors and shared state synchronization.",
  },
  {
    icon: FileText,
    title: "Automated Specifications",
    description:
      "Generate exportable Markdown documentation and systems design docs directly from your architecture.",
  },
];

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base font-sans">
      <aside className="relative hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 bg-accent-dim" />
        <div className="relative flex w-full flex-col px-12 py-10 xl:px-16">
          <div className="flex items-center gap-2.5">
            <OmniArchLogo variant="full" size="md" />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <h1 className="font-heading max-w-lg text-4xl font-semibold tracking-tight text-copy-primary xl:text-5xl">
              Design systems at the speed of thought.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-copy-secondary">
              Describe your architecture in plain English. OmniArch maps it to a
              shared canvas your whole team can refine in real time.
            </p>

            <ul className="mt-12 max-w-md space-y-6">
              {features.map(({ title, description, icon: Icon }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-accent-dim text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-medium text-copy-primary">
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-copy-muted">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-copy-faint">
            © {new Date().getFullYear()} OmniArch. All rights reserved.
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-base p-6 lg:w-1/2">
        {children}
      </main>
    </div>
  );
}
