import StartReportButton from "./StartReportButton.jsx";

export default function CTASection() {
  return (
    <section className="bg-paper px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-ink px-6 py-12 text-center sm:px-10 sm:py-14">
          <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
            Your case doesn't have to stay unfiled.
          </h2>
          <div className="mt-8 flex justify-center">
            <StartReportButton className="focus-visible:ring-offset-ink">
              Start your report →
            </StartReportButton>
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-paper/50">
            FREE · ENCRYPTED · ~6 MIN AVG.
          </p>
        </div>
      </div>
    </section>
  );
}
