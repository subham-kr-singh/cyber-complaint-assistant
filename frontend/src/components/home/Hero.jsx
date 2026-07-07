import StartReportButton, { focusRing } from "./StartReportButton.jsx";

export default function Hero() {
  return (
    <section className="border-b border-paperDim bg-paper px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-wider text-brass sm:text-sm">
          CASE #2026-04217 · FILED IN 6 MINUTES
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
          Cybercrime is confusing to report. We made it simple to file.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-paperText/80 sm:text-lg">
          A guided assistant that walks you through what happened, preserves your evidence,
          drafts a complete complaint, and routes it to the right authority.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <StartReportButton>Start your report →</StartReportButton>
          <a
            href="#how"
            className={`text-sm font-medium text-paperText underline-offset-4 transition-colors hover:text-stampRed hover:underline ${focusRing}`}
          >
            See how it works
          </a>
        </div>

        <ul className="mt-12 grid gap-6 border-t border-paperDim pt-8 sm:grid-cols-3">
          <li>
            <p className="font-display text-xl font-semibold text-ink">1 in 3</p>
            <p className="mt-1 text-sm text-paperText/70">victims never file a complaint</p>
          </li>
          <li>
            <p className="font-display text-xl font-semibold text-ink">48 hrs</p>
            <p className="mt-1 text-sm text-paperText/70">evidence window</p>
          </li>
          <li>
            <p className="font-display text-xl font-semibold text-ink">&lt;10 min</p>
            <p className="mt-1 text-sm text-paperText/70">average filing time</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
