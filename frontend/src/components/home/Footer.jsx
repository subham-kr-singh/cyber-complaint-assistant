import { focusRing } from "./StartReportButton.jsx";

const GITHUB_URL = "https://github.com/subham-kr-singh/cyber-complaint-assistant";

const linkClass = `text-sm text-paper/70 transition-colors hover:text-paper ${focusRing} focus-visible:ring-offset-ink rounded-sm`;

export default function Footer() {
  return (
    <footer className="border-t border-inkLine bg-ink px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-paper">CyberSetu</p>
          <p className="mt-1 max-w-xs text-sm text-paper/60">
            Smart Cyber Complaint Support — guided reporting for cybercrime victims.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#how" className={linkClass}>
            How it works
          </a>
          <a href="#features" className={linkClass}>
            Features
          </a>
          <a href="#" className={linkClass}>
            Privacy
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={linkClass}>
            GitHub
          </a>
        </nav>

        <div className="font-mono text-xs text-paper/50">
          <p>&copy; {new Date().getFullYear()} Team CyberSetu</p>
          <p className="mt-1">Safe Click Hackathon 2.0</p>
        </div>
      </div>
    </footer>
  );
}
