import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="
        relative
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-b
        from-sky-300
        to-slate-100
        overflow-hidden
      "
    >
      {/* LEFT CLOUD */}
      <motion.img
        src="/cloud-left.svg"
        alt="cloud"
        className="
          absolute
          top-24
          left-0
          w-72
          opacity-60
          pointer-events-none
        "
        animate={{ x: [-20, 20, -20] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* RIGHT CLOUD */}
      <motion.img
        src="/cloud-right.svg"
        alt="cloud"
        className="
          absolute
          top-24
          right-0
          w-72
          opacity-60
          pointer-events-none
        "
        animate={{ x: [20, -20, 20] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          flex
          flex-col
          items-center
          gap-8
          text-center
          px-6
        "
      >
        {/* Badge */}
        <div
          className="
            px-4
            py-2
            bg-white/80
            rounded-full
            shadow
            text-sm
          "
        >
          ✨ Voice AI Agent
        </div>

        {/* Title */}
        <h1
          className="
            text-6xl
            md:text-7xl
            font-bold
            tracking-tight
            leading-tight
          "
        >
          Run your freelance
          <br />
          <span
            className="
              bg-gradient-to-r
              from-indigo-500
              to-purple-500
              text-transparent
              bg-clip-text
            "
          >
            business like a pro
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="
            text-lg
            text-gray-600
            max-w-xl
          "
        >
          All-in-one platform for managing clients, projects,
          and payments.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            className="
              bg-black
              text-white
              px-7
              py-3
              rounded-full
              hover:scale-105
              transition
            "
          >
            Try Free →
          </button>

          <button
            className="
              bg-gray-100
              px-7
              py-3
              rounded-full
              hover:bg-gray-200
              transition
            "
          >
            See features
          </button>
        </div>
      </motion.div>
    </section>
  );
}