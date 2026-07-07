import {
  FaComments,
  FaLock,
  FaFileAlt,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: FaComments,
    title: "Plain-language guidance",
    description: "No legal jargon — just the questions that matter, asked one at a time.",
  },
  {
    icon: FaLock,
    title: "Evidence vault",
    description: "Encrypted, timestamped storage captured before it's lost or overwritten.",
  },
  {
    icon: FaFileAlt,
    title: "Auto-drafted complaint",
    description: "A clean, authority-formatted document. No blank-page panic.",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Correct-authority routing",
    description: "No more guessing which portal, department, or helpline to call.",
  },
  {
    icon: FaShieldAlt,
    title: "Private by default",
    description: "You control what's shared, and with whom, at every step.",
  },
  {
    icon: FaChartLine,
    title: "Status tracking",
    description: "Real tracking from filed to resolved — not silence after submission.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-b border-paperDim bg-paper px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Built for the moment you're in
        </h2>
        <p className="mt-3 max-w-2xl text-paperText/70">
          Most portals were built for officers. This one was built for the person filling it
          out at 11pm, still shaking.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-lg border border-paperDim bg-white/50 p-5 transition-shadow motion-safe:hover:shadow-sm"
            >
              <Icon className="text-xl text-brass" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paperText/70">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
