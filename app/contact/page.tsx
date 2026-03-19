"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { ArrowUpRight } from "lucide-react";

type ContactCardData = {
    eyebrow: string;
    title: string;
    description: string;
    value: string;
    href?: string;
    cta?: string;
};

type SocialLinkData = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

const accent = "#5ce1e6";

const contactCards: ContactCardData[] = [
    {
        eyebrow: "Email",
        title: "CSI Inbox",
        description: "For registrations, event updates, and general questions. (CSI)",
        value: "csi@sfit.ac.in",
        href: "mailto:csi@sfit.ac.in",
        cta: "Write now →",
    },
    {
        eyebrow: "Email",
        title: "GDG Inbox",
        description: "For registrations, event updates, and general questions. (GDG)",
        value: "gdgsfit@gmail.com",
        href: "mailto:gdgsfit@gmail.com",
        cta: "Write now →",
    },
    {
        eyebrow: "Phone 01",
        title: "Aryan Brahmane",
        description: "CSI Treasurer",
        value: "+91 93252 09355",
        href: "tel:+919325209355",
        cta: "Call →",
    },
    {
        eyebrow: "Phone 03",
        title: "Rayan Pawar",
        description: "CSI Marketing Head",
        value: "+91 93729 37532",
        href: "tel:+919372937532",
        cta: "Call →",
    },
    {
        eyebrow: "Venue Address",
        title: "Auditorium, S.F.I.T.",
        description: "St. Francis Institute of Technology, Borivali West, Mumbai.",
        value: "Mount Poinsur, S.V.P. Road, Borivali West, Mumbai - 400103",
        href: "https://maps.google.com/?q=St.+Francis+Institute+of+Technology,+Mount+Poinsur,+S.V.P.+Road,+Borivali+West,+Mumbai+-+400103",
        cta: "Open in Maps →",
    },
];

function SocialIcon({ children }: { children: React.ReactNode }) {
    return <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black/10 bg-black/5">{children}</span>;
}

function LinktreeIcon() {
    return (
        <SocialIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v18" strokeLinecap="round" />
                <path d="M7 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12h12" strokeLinecap="round" />
                <path d="M8 17l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </SocialIcon>
    );
}

function LinkedInIcon() {
    return (
        <SocialIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3ZM20.44 12.7c0-3.46-1.85-5.07-4.32-5.07-1.99 0-2.88 1.09-3.38 1.86V8.5H9.37c.04.66 0 11.5 0 11.5h3.37v-6.42c0-.34.02-.68.13-.92.27-.67.88-1.36 1.92-1.36 1.35 0 1.89 1.03 1.89 2.54V20h3.37v-7.3Z" />
            </svg>
        </SocialIcon>
    );
}

function FacebookIcon() {
    return (
        <SocialIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-7h2.35l.4-3h-2.75V9.08c0-.87.24-1.46 1.49-1.46H16.4V4.94c-.24-.03-1.07-.1-2.03-.1-2 0-3.37 1.22-3.37 3.47V11H8.75v3H11V21h2.5Z" />
            </svg>
        </SocialIcon>
    );
}

function InstagramIcon() {
    return (
        <SocialIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
            </svg>
        </SocialIcon>
    );
}

function XIcon() {
    return (
        <SocialIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.9 4H21l-4.6 5.26L21.82 20h-4.24l-3.32-4.92L9.95 20H7.84l4.92-5.62L2.5 4h4.35l3 4.54L13.8 4h5.1ZM18.15 18.6h1.18L6.7 5.33H5.43L18.15 18.6Z" />
            </svg>
        </SocialIcon>
    );
}

const socialLinks: SocialLinkData[] = [
    { label: "Unstop (HackX 2.0)", href: "https://unstop.com/o/X6Qsj0O?lb=PdelV0YM&utm_medium=Share&utm_source=csisfi85205&utm_campaign=Online_coding_challenge", icon: <LinktreeIcon /> },
    { label: "CSI SFIT Website", href: "https://csi-sfit.vercel.app/", icon: <LinkedInIcon /> },
    { label: "LinkedIn (CSI-SFIT)", href: "https://www.linkedin.com/company/csi-sfit/", icon: <LinkedInIcon /> },
    // { label: "Facebook", href: "https://facebook.com/placeholder", icon: <FacebookIcon /> },
    { label: "Instagram (CSI-SFIT)", href: "https://instagram.com/csi_sfit/", icon: <InstagramIcon /> },
    { label: "Instagram (GDG-SFIT)", href: "https://instagram.com/gdg.sfit/", icon: <InstagramIcon /> },
];

type ContactCardProps = ContactCardData & {
    accent: string;
    isLightMode: boolean;
};

function ContactCard({ eyebrow, title, value, href, cta, accent, isLightMode }: ContactCardProps) {
    const content = (
        <>
            <div
                className={`flex h-10 items-center justify-between border-2 px-3 text-[10px] font-bold uppercase tracking-widest xl:h-12 xl:text-xs ${isLightMode ? "border-black/10 bg-black/5 text-black/40" : "border-white/10 bg-white/5 text-white/30"
                    }`}
                style={{ borderTopColor: accent }}
            >
                <span>{eyebrow}</span>
                <span style={{ color: accent }}>{cta ? <ArrowUpRight className="w-4 h-4 stroke-[3px]" /> : "·"}</span>
            </div>
            <div>
                <p className={`text-xs font-black uppercase tracking-widest xl:text-sm ${isLightMode ? "text-black" : "text-white"}`}>{title}</p>
                <p className={`mt-1 text-[10px] leading-4 xl:text-xs xl:leading-5 ${isLightMode ? "text-black/65" : "text-white/65"}`}>{value}</p>
            </div>
            {cta && (
                <span className="mt-auto text-[10px] font-black uppercase tracking-widest xl:text-[11px]" style={{ color: accent }}>
                    {cta}
                </span>
            )}
        </>
    );

    const className = `pointer-events-auto group flex h-full flex-col gap-2 border-2 p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 xl:gap-3 xl:p-4 ${isLightMode
        ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
        : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
        }`;

    if (href) {
        return (
            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className={className}>
                {content}
            </a>
        );
    }

    return <article className={className}>{content}</article>;
}

export default function ContactPage() {
    const { isLightMode } = useTheme();

    return (
        <div className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}>
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
                <div className="text-left w-full mx-auto relative z-20 pointer-events-auto pb-10">
                    <header className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] xl:text-xs ${isLightMode ? "text-black/55" : "text-white/50"}`}>Hack X 2.0</p>
                        <h1
                            className={`text-center font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 ${isLightMode ? "text-black" : "text-white"}`}
                        >
                            Contact The Team
                        </h1>
                        <p className={`text-center font-black uppercase tracking-widest text-sm mb-16 px-4 py-2 border-[3px] mx-auto w-fit ${isLightMode ? "border-black bg-[#5ce1e6] text-black" : "border-[#5ce1e6] bg-black text-[#5ce1e6]"}`}>
                            Email • Phone • Venue • Socials
                        </p>
                    </header>

                    <section className="w-full">
                        <div className={`mb-10 border-[3px] p-6 sm:p-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}>
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.34em] ${isLightMode ? "text-black/50" : "text-white/55"}`}>Contact info</p>
                                    <h2 className={`mt-3 font-black uppercase tracking-tighter text-4xl sm:text-5xl ${isLightMode ? "text-black" : "text-white"}`}>
                                        Reach Us
                                    </h2>
                                </div>
                                <span
                                    className="inline-flex w-fit border-[3px] border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black"
                                    style={{ backgroundColor: accent }}
                                >
                                    06 details
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
                                {contactCards.map((card, index) => (
                                    <div
                                        key={card.title}
                                        className="h-full scale-100 transition-all duration-500"
                                        style={{ transitionDelay: `${80 + index * 50}ms` }}
                                    >
                                        <ContactCard {...card} accent={accent} isLightMode={isLightMode} />
                                    </div>
                                ))}
                            </div>

                            <aside
                                className={`pointer-events-auto group flex h-full flex-col gap-4 border-2 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 xl:p-6 ${isLightMode
                                    ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
                                    : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
                                    } scale-100`}
                            >
                                <div className={`border-b pb-2 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.34em] xl:text-[11px] ${isLightMode ? "text-black/50" : "text-white/55"}`}>Socials</p>
                                    <h3 className={`mt-2 font-black uppercase tracking-tighter text-3xl ${isLightMode ? "text-black" : "text-white"}`}>
                                        Follow Along
                                    </h3>
                                </div>

                                <div className="grid gap-3 flex-1">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-center gap-3 border-2 h-full min-h-0 transition-all duration-300 hover:-translate-y-0.5 ${isLightMode
                                                ? "border-black/10 bg-black/5 text-black hover:border-black/35"
                                                : "border-white/10 bg-white/5 text-white hover:border-white/35"
                                                }`}
                                        >
                                            {social.icon}
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] xl:text-xs">{social.label}</p>
                                        </a>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
