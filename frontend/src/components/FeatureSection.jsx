export default function FeatureSection() {
  const features = [
    {
      icon: "🎤",
      title: "Voice Input",
      desc: "Record or upload audio files",
    },
    {
      icon: "🧠",
      title: "Intent Detection",
      desc: "AI classifies your commands",
    },
    {
      icon: "⚡",
      title: "Auto Execute",
      desc: "Actions run automatically",
    },
  ];

  return (
    <section
      id="features"
      className="
        py-28
        bg-gray-50
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          text-center
        "
      >
        <h2 className="text-4xl font-bold">
          Features
        </h2>

        <p className="text-gray-600 mt-4">
          A complete voice-controlled AI agent running locally
        </p>

        <div
          className="
            grid
            md:grid-cols-3
            gap-10
            mt-16
          "
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="
                bg-white
                p-8
                rounded-3xl
                shadow-lg
                hover:-translate-y-2
                hover:shadow-xl
                transition
              "
            >
              <div className="text-4xl">
                {f.icon}
              </div>

              <h3 className="text-xl font-semibold mt-4">
                {f.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}