"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

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
    a: "Teams can have 3 or 4 members. You can either form a team beforehand or find teammates on our community whatsapp group  .",
  },
  {
    q: "Is there a registration fee?",
    a: "A registration fee will be applicable only if you are shortlisted in the first round. The fee is ₹250 per participant.",
  },
  {
    q: "Will the problem statements be given in advance?",
    a: "The broad domains (Cyber Defence & Digital Trust, Digital Economy, InfraTech, Future Mobility & Transportation) are known, but the exact problem statements are revealed during the opening ceremony to maintain equal footing.",
  },
  {
    q: "Is accommodation provided for outstation participants?",
    a: "Yes! A common room will be provided for participants within the college campus; no additional accommodation will be available.",
  },
  {
    q: "What should I bring to the hackathon?",
    a: "Bring your laptop, charger, any hardware you plan to use, a valid college ID, and your energy! We will provide food, refreshments, internet, and a fully equipped hacking space for the duration of the event.",
  },
  {
    q: "Are there any prizes?",
    a: "Yes! HackX 2.0 features exciting prizes across multiple domains. There are four domains, and each domain will have a single winner who will be awarded ₹25k. In addition, there will be prizes for special categories such as Best UI, Best Idea, and more.",
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
    a: "Follow our official social media handles and keep an eye on the registration portal for announcements, schedule updates, and sponsor reveals. ",
  },
] as const;

function AccordionItem({
  question,
  answer,
  isLightMode,
}: {
  question: string;
  answer: string;
  isLightMode: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={`cursor-target group border-[3px] h-fit transition-all duration-300 ${
        isLightMode
          ? "border-black bg-white shadow-[4px_4px_0_#000]"
          : "border-white/40 bg-[#111] shadow-[4px_4px_0_#c0ff00]"
      } ${isOpen ? "-translate-y-1" : "hover:-translate-y-0.5"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between p-6 text-left font-black uppercase tracking-wide text-lg sm:text-xl focus:outline-none ${isLightMode ? "text-black" : "text-white"}`}
      >
        {question}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={`ml-4 text-2xl transition-colors duration-300 ${isLightMode ? "text-[#ff00a0]" : "text-[#c0ff00]"}`}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={`mx-6 pb-6 font-bold leading-relaxed border-t-[3px] mt-2 pt-4 ${isLightMode ? "text-black/80 border-black/10" : "text-white/80 border-white/10"}`}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "1400px",
              }}
            >
              {FAQ_ITEMS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isLightMode={isLightMode}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
