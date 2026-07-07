const STEPS = [
  {
    num: "01",
    title: "Report",
    description:
      "Answer guided questions — what happened, when, which platform or app, any money lost, and suspect details — in your own words.",
  },
  {
    num: "02",
    title: "Diagnose",
    description:
      "Once your answers are saved, we classify the incident type and identify exactly what evidence you'll need to gather.",
  },
  {
    num: "03",
    title: "Evidence",
    description:
      "Upload screenshots, transaction IDs, and chat logs — stored securely and timestamped before they disappear.",
  },
  {
    num: "04",
    title: "Draft",
    description:
      "A formatted complaint summary and downloadable PDF are generated automatically when you're ready to submit.",
  },
  {
    num: "05",
    title: "Route",
    description:
      "Your case is matched to the correct authority portal or cyber cell from our routing lookup table.",
  },
  {
    num: "06",
    title: "Track",
    description:
      "Follow real status updates from draft through submitted, filed, and resolved — no silence after filing.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-b border-paperDim bg-paper px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Six steps. One case file. No guesswork.
        </h2>
        <p className="mt-3 max-w-2xl text-paperText/70">
          Every complaint follows the same guided path — from your first answer through
          classification, evidence, and submission.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.num}
              className="rounded-lg border border-paperDim bg-white/50 p-5 transition-shadow motion-safe:hover:shadow-sm"
            >
              <span className="inline-block rounded bg-brass/10 px-2 py-0.5 font-mono text-xs font-medium text-brass">
                {step.num}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paperText/70">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
