"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/app/providers/theme-provider";

type AboutCard = {
  title: string;
  subtitle: string;
  description: string;
  href?: string;
  cta?: string;
};

const sections = {
  mission: {
    label: "Mission & Vision",
    accent: "#ffd23f",
    intro:
      "The hackathon is built to turn curiosity into working solutions through open collaboration, practical experimentation, and community-led learning.",
    colClass: "sm:grid-cols-2 lg:grid-cols-3",
    cards: [
      {
        title: "Build With Purpose",
        subtitle: "Mission",
        description:
          "Create space for students to solve meaningful problems with technology, design, and clear user impact in mind.",
      },
      {
        title: "Learn In Public",
        subtitle: "Vision",
        description:
          "Encourage rapid prototyping, mentor feedback, and peer learning so every team leaves with stronger skills and sharper execution.",
      },
      {
        title: "Community First",
        subtitle: "Core Value",
        description:
          "Keep the experience inclusive, ambitious, and collaborative, with equal emphasis on innovation, support, and team culture.",
      },
    ],
  },
  bharat50: {
    label: "Bharat 5.0 Vision",
    accent: "#ff6b35",
    intro:
      "Aligning with India's ambitious vision for 2047, we're fostering innovation that contributes to building a developed, digitally empowered, and technologically advanced India.",
    colClass: "sm:grid-cols-2 lg:grid-cols-3",
    cards: [
      {
        title: "Digital India Initiative",
        subtitle: "Technology for All",
        description:
          "Building solutions that bridge the digital divide and empower every citizen with access to technology, digital literacy, and innovative services that transform lives at scale.",
      },
      {
        title: "Innovation Ecosystem",
        subtitle: "Startup Nation",
        description:
          "Nurturing the next generation of tech entrepreneurs and innovators who will drive India's position as a global technology powerhouse and innovation hub.",
      },
      {
        title: "Sustainable Development",
        subtitle: "Green Innovation",
        description:
          "Creating technology solutions that address climate change, promote sustainable practices, and contribute to India's net-zero commitments while driving economic growth.",
      },
      {
        title: "Skill India 2.0",
        subtitle: "Future Workforce",
        description:
          "Developing cutting-edge technical skills, AI/ML expertise, and digital capabilities that prepare students for the jobs of tomorrow in India's knowledge economy.",
      },
    ],
  },
  organizers: {
    label: "The Organizers",
    accent: "#1fe0ff",
    intro:
      "The event is co-organized by two active campus communities that combine academic rigor, technical depth, and strong developer outreach.",
    colClass: "sm:grid-cols-2",
    cards: [
      {
        title: "Computer Society of India - SFIT",
        subtitle: "Academic Innovation Partner",
        description:
          "We are a premier student body dedicated to advancing the theory and practice of computer engineering. We bridge the gap between academic curriculum and industry demands by consistently organising rigorous technical workshops, seminars, and competitive coding events that shape the technical leaders of tomorrow.",
        href: "https://csi-sfit.vercel.app/",
        cta: "Visit CSI SFIT",
      },
      {
        title: "Google Developer Group - SFIT",
        subtitle: "Developer Community Partner",
        description:
          "As a community-driven developer ecosystem, we focus on fostering an environment of open- source collaboration and cutting- edge innovation. We empower students to build real-world solutions using modern developer tools, creating a vibrant culture of peer-to-peer learning and technological exploration.",
      },
    ],
  }
} as const;

const sectionOrder = [
  {
    key: "mission" as const,
    label: sections.mission.label,
    accent: sections.mission.accent,
  },
  {
    key: "bharat50" as const,
    label: sections.bharat50.label,
    accent: sections.bharat50.accent,
  },
  {
    key: "organizers" as const,
    label: sections.organizers.label,
    accent: sections.organizers.accent,
  }
];

type SectionKey = (typeof sectionOrder)[number]["key"];

type AboutCardProps = AboutCard & {
  accent: string;
  isLightMode: boolean;
};

function InfoCard({
  title,
  subtitle,
  description,
  href,
  cta,
  accent,
  isLightMode,
}: AboutCardProps) {
  const content = (
    <>
      <div
        className={`flex h-20 items-center justify-between border-2 px-4 text-sm font-bold uppercase tracking-widest xl:h-22 xl:text-[0.8125rem] ${isLightMode
          ? "border-black/10 bg-black/5 text-black/40"
          : "border-white/10 bg-white/5 text-white/30"
          }`}
        style={{ borderTopColor: accent }}
      >
        <span>{subtitle}</span>
        <span style={{ color: accent }}>01</span>
      </div>
      <div>
        <p
          className={`cursor-target text-base font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"}`}
        >
          {title}
        </p>
        <p
          className={`cursor-target mt-2 text-sm leading-6 xl:text-[0.9375rem] xl:leading-relaxed ${isLightMode ? "text-black/65" : "text-white/65"}`}
        >
          {description}
        </p>
      </div>
      <span
        className="cursor-target mt-auto text-[11px] font-black uppercase tracking-widest xl:text-xs"
        style={{ color: accent }}
      >
        {cta ?? (href ? "Open →" : "Core Focus")}
      </span>
    </>
  );

  const className = `cursor-target pointer-events-auto group flex h-full flex-col gap-4 border-2 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${isLightMode
    ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
    : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
    }`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <article className={className}>{content}</article>;
}

function SectionButton({
  active,
  label,
  accent,
  isLightMode,
  onClick,
}: {
  active: boolean;
  label: string;
  accent: string;
  isLightMode: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-target pointer-events-auto border-2 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all duration-300 sm:text-sm xl:text-sm ${active
        ? isLightMode
          ? "border-black bg-[#fff7d6] text-black shadow-[5px_5px_0_#000]"
          : "border-black bg-white text-black shadow-[5px_5px_0_#000]"
        : isLightMode
          ? "border-black/15 bg-white/55 text-black/70 hover:border-black/40 hover:text-black"
          : "border-white/20 bg-black/45 text-white/72 hover:border-white/45 hover:text-white"
        }`}
      style={active ? { boxShadow: `5px 5px 0 ${accent}` } : undefined}
    >
      {label}
    </button>
  );
}

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("mission");
  const [displaySection, setDisplaySection] = useState<SectionKey>("mission");
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const { isLightMode } = useTheme();
  const switchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current !== null) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  const handleSectionChange = (nextSection: SectionKey) => {
    if (nextSection === activeSection) {
      return;
    }

    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
    }

    setActiveSection(nextSection);
    setIsSectionVisible(false);
    switchTimerRef.current = window.setTimeout(() => {
      setDisplaySection(nextSection);
      setIsSectionVisible(true);
      switchTimerRef.current = null;
    }, 180);
  };

  const activeMeta =
    sectionOrder.find((section) => section.key === activeSection) ??
    sectionOrder[0];
  const displayMeta =
    sectionOrder.find((section) => section.key === displaySection) ??
    sectionOrder[0];
  const displayContent = sections[displayMeta.key];

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        <div className="text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
          <header className="text-center">
            <p
              className={`cursor-target text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
            >
              Hack X 2.0
            </p>
            <h1
              className={`cursor-target text-center font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 ${isLightMode ? "text-black" : "text-white"}`}
            >
              About The Event
            </h1>
            <p
              className={`cursor-target text-center font-black uppercase tracking-widest text-sm mb-16 px-4 py-2 border-[3px] mx-auto w-fit ${isLightMode ? "border-black bg-[#ffd23f] text-black" : "border-[#ffd23f] bg-black text-[#ffd23f]"}`}
            >
              Mission • Bharat 5.0 • Organizers
            </p>
          </header>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {sectionOrder.map((section) => (
              <SectionButton
                key={section.key}
                active={section.key === activeSection}
                label={section.label}
                accent={section.accent}
                isLightMode={isLightMode}
                onClick={() => handleSectionChange(section.key)}
              />
            ))}
          </div>

          <section className="w-full">
            <div
              className={`cursor-target mb-10 border-[3px] p-6 sm:p-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p
                    className={`cursor-target text-[10px] font-black uppercase tracking-[0.34em] ${isLightMode ? "text-black/50" : "text-white/55"}`}
                  >
                    About section
                  </p>
                  <h2
                    className={`cursor-target mt-3 font-black uppercase tracking-tighter text-4xl sm:text-5xl ${isLightMode ? "text-black" : "text-white"}`}
                  >
                    {displayContent.label}
                  </h2>
                </div>
                <span
                  className="cursor-target inline-flex w-fit border-[3px] border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black"
                  style={{ backgroundColor: displayMeta.accent }}
                >
                  {String(displayContent.cards.length).padStart(2, "0")} tiles
                </span>
              </div>
              <p
                className={`cursor-target mt-6 max-w-3xl text-sm sm:text-base font-bold leading-relaxed ${isLightMode ? "text-black/70" : "text-white/70"}`}
              >
                {displayContent.intro}
              </p>
            </div>

            <div
              className={`grid auto-rows-auto gap-6 ${displayContent.colClass} ${isSectionVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                } transition-all duration-300`}
            >
              {displayContent.cards.map((card, index) => (
                <div
                  key={`${displayMeta.key}-${index}`}
                  className={`transition-all duration-500 ${isSectionVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
                  style={{ transitionDelay: `${isSectionVisible ? 80 + index * 70 : 0}ms` }}
                >
                  <InfoCard
                    {...card}
                    accent={displayMeta.accent}
                    isLightMode={isLightMode}
                  />
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
