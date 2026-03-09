"use client";

import { useTheme } from "@/app/providers/theme-provider";

const STYLES = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(2deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes float-reverse {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(15px) rotate(-2deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .text-outline-light {
    -webkit-text-stroke: 2px black;
    color: transparent;
  }
  .text-outline-dark {
    -webkit-text-stroke: 2px white;
    color: transparent;
  }
`;

const FAQ_ITEMS = [
  {
    q: "What is HackX 2.0?",
    a: "HackX 2.0 is a 24-hour national-level hackathon aimed at solving real-world challenges to shape the future of Digital Bharat. It brings together over 10,000 developers, designers, and innovators.",
  },
  {
    q: "Who can participate?",
    a: "Any student enrolled in a recognized university or college can participate. Whether you are a first-year student or a final-year expert, you are welcome to build with us!",
  },
  {
    q: "What is the team size?",
    a: "Teams can have 2 to 4 members. You can either form a team beforehand or find teammates during the registration phase.",
  },
  {
    q: "Is there a registration fee?",
    a: "Details regarding the registration fee and process are updated on the registration portal. Check out the portal for the most recent timeline and fees!",
  },
  {
    q: "Will the problem statements be given in advance?",
    a: "The broad domains (Cyber Defence, FinTech, Smart Cities, Future Mobility) are known, but the exact problem statements are revealed during the opening ceremony to maintain equal footing.",
  },
  {
    q: "Is accommodation provided for outstation participants?",
    a: "Yes! Accommodation will be arranged for outstation participants on a first-come, first-served basis. Make sure to indicate your requirement during registration so we can plan accordingly.",
  },
  {
    q: "What should I bring to the hackathon?",
    a: "Bring your laptop, charger, any hardware you plan to use, a valid college ID, and your energy! We will provide food, internet, and a fully equipped hacking space for the duration of the event.",
  },
  {
    q: "Are there any prizes?",
    a: "Yes! HackX 2.0 features exciting cash prizes, goodies, and recognition across multiple tracks. Top teams may also get opportunities for mentorship and incubation support. Full prize details will be announced soon.",
  },
  {
    q: "Do I need to have a fully built project before the event?",
    a: "No. All projects must be built from scratch during the 24-hour hackathon window. You may brainstorm and research beforehand, but no pre-built code or existing projects are allowed.",
  },
  {
    q: "What technologies or tools can I use?",
    a: "You are free to use any programming language, framework, or tool. Open-source libraries are allowed. If you use any third-party APIs or services, make sure to disclose them during your final submission.",
  },
  {
    q: "Will there be mentors available during the hackathon?",
    a: "Absolutely! Industry professionals and domain experts will be available throughout the event to guide your team, review your ideas, and help you navigate technical challenges.",
  },
  {
    q: "How will projects be judged?",
    a: "Projects will be evaluated on innovation, technical complexity, real-world impact, design, and presentation. A panel of judges from industry and academia will score each submission at the end of the hackathon.",
  },
  {
    q: "Can I participate if I don't have a team yet?",
    a: "Yes! We will host a team-formation session before the hackathon begins. You can connect with other solo participants and form a team on the spot. No one has to hack alone.",
  },
  {
    q: "Where will HackX 2.0 be held?",
    a: "HackX 2.0 will be held at St. Francis Institute of Technology (SFIT), Mumbai. Detailed venue and logistics information will be shared with registered participants closer to the event date.",
  },
  {
    q: "How do I stay updated about HackX 2.0?",
    a: "Follow our official social media handles and keep an eye on the registration portal for announcements, schedule updates, and sponsor reveals. You can also subscribe to our newsletter for direct updates.",
  },
] as const;

export default function FAQPage() {
  const { isLightMode } = useTheme();

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation */}

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
          <div className="text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
            <h2
              className={`text-center font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-16 ${isLightMode ? "text-black" : "text-white"}`}
            >
              FAQ
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }}
            >
              {FAQ_ITEMS.map((faq, i) => (
                <details
                  key={i}
                  className={`cursor-target group border-[3px] [&_summary::-webkit-details-marker]:hidden ${
                    isLightMode
                      ? "border-black bg-white shadow-[4px_4px_0_#000]"
                      : "border-white/30 bg-[#111] shadow-[4px_4px_0_#fff]"
                  }`}
                >
                  <summary
                    className={`flex cursor-pointer items-center justify-between p-6 font-black uppercase tracking-wide text-lg sm:text-xl focus:outline-none ${isLightMode ? "text-black" : "text-white"}`}
                  >
                    {faq.q}
                    <span
                      className={`ml-4 text-2xl transition-transform duration-300 group-open:rotate-45 ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    className={`px-6 pb-6 font-bold leading-relaxed border-t-[3px] mt-2 pt-4 ${isLightMode ? "text-black/80 border-black/10" : "text-white/80 border-white/10"}`}
                  >
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </main>

        <footer className="relative z-50 pointer-events-auto w-full border-t-[3px] py-12 px-6 sm:px-12 mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-500 border-black/20 bg-black/5 backdrop-blur-sm">
          <div
            className={`text-2xl font-black uppercase tracking-tighter ${isLightMode ? "text-black" : "text-white"}`}
          >
            HACKX <span className="text-[#ff00a0]">2.0</span>
          </div>
          <div
            className={`text-sm font-bold uppercase tracking-widest ${isLightMode ? "text-black/60" : "text-white/60"}`}
          >
            By CSI and GDG at SFIT • 2026
          </div>
        </footer>
      </div>
    </div>
  );
}
