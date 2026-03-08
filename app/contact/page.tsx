"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { WaveTiles } from "@/ui/components/basic/wave-tiles";

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
        eyebrow: "Phone 02",
        title: "Edwin Moses",
        description: "GDG Marketing Head",
        value: "+91 70215 33681",
        href: "tel:+917021533681",
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
    { label: "Linktree", href: "https://linktr.ee/placeholder", icon: <LinktreeIcon /> },
    { label: "LinkedIn", href: "https://linkedin.com/company/placeholder", icon: <LinkedInIcon /> },
    { label: "Facebook", href: "https://facebook.com/placeholder", icon: <FacebookIcon /> },
    { label: "Instagram", href: "https://instagram.com/placeholder", icon: <InstagramIcon /> },
    { label: "X", href: "https://x.com/placeholder", icon: <XIcon /> },
];

type ContactCardProps = ContactCardData & {
    accent: string;
    isLightMode: boolean;
};

function ContactCard({ eyebrow, title, value, href, cta, accent, isLightMode }: ContactCardProps) {
    const content = (
        <>
            <div
                className={`flex h-10 items-center justify-between border-2 px-3 text-[10px] font-bold uppercase tracking-widest xl:h-12 xl:text-xs ${
                    isLightMode ? "border-black/10 bg-black/5 text-black/40" : "border-white/10 bg-white/5 text-white/30"
                }`}
                style={{ borderTopColor: accent }}
            >
                <span>{eyebrow}</span>
                <span style={{ color: accent }}>{cta ? "↗" : "·"}</span>
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
    const [isLightMode, setIsLightMode] = useState(true);
    const [isModeAnimating, setIsModeAnimating] = useState(false);
    const hasMountedRef = useRef(false);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }

        setIsModeAnimating(true);
        const animationTimer = window.setTimeout(() => setIsModeAnimating(false), 520);

        return () => window.clearTimeout(animationTimer);
    }, [isLightMode]);

    const rootTone = isLightMode ? "text-black" : "text-white";

    return (
        <div className={`relative h-screen overflow-hidden bg-black transition-colors duration-500 ${rootTone}`}>
            <div className="fixed inset-0 z-0">
                <WaveTiles className={isLightMode ? "opacity-95" : "opacity-60"} onModeChange={setIsLightMode} trackPointerGlobally />
            </div>
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div
                    className={`absolute left-[6%] top-[8%] h-44 w-44 rounded-full blur-3xl transition-all duration-700 ${isLightMode ? "bg-[#5ce1e6]/38 opacity-100 scale-110" : "bg-[#5ce1e6]/18 opacity-55 scale-100"
                        } ${isModeAnimating ? "animate-pulse" : ""}`}
                />
                <div
                    className={`absolute bottom-[10%] right-[8%] h-56 w-56 rounded-full blur-3xl transition-all duration-700 ${isLightMode ? "bg-[#ff6b8a]/24 opacity-80 scale-110" : "bg-[#ff6b8a]/15 opacity-45 scale-100"
                        } ${isModeAnimating ? "animate-pulse" : ""}`}
                />
                <div
                    className={`absolute right-[18%] top-[14%] h-28 w-28 rounded-full blur-2xl transition-all duration-700 ${isLightMode ? "bg-[#7ddc7a]/28 opacity-90" : "bg-[#7ddc7a]/10 opacity-25"
                        }`}
                />
            </div>
            <div
                className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
                style={{
                    background: isLightMode
                        ? "linear-gradient(135deg, rgba(240,252,255,0.94) 0%, rgba(218,247,255,0.72) 28%, rgba(255,247,250,0.45) 100%), radial-gradient(circle at 18% 18%, rgba(92,225,230,0.46), transparent 28%), radial-gradient(circle at 82% 14%, rgba(255,107,138,0.24), transparent 24%), radial-gradient(circle at 52% 78%, rgba(125,220,122,0.22), transparent 24%)"
                        : "linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.42) 40%, rgba(0,0,0,0.82) 100%)",
                }}
            />

            <main className="pointer-events-none relative z-10 mx-auto flex h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:max-w-360 xl:px-10 xl:py-8">
                <header className="shrink-0 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] xl:text-xs ${isLightMode ? "text-black/55" : "text-white/50"}`}>Hack X 2.0</p>
                    <h1
                        className={`navbar-font mt-2 text-3xl uppercase leading-none transition-all duration-500 sm:text-5xl xl:text-[3.8rem] ${isModeAnimating ? "scale-[1.02]" : "scale-100"}`}
                        style={{ textShadow: `3px 3px 0 ${accent}` }}
                    >
                        Contact The Team
                    </h1>
                    <p className={`mx-auto mt-2 max-w-2xl text-xs leading-5 sm:text-sm xl:max-w-3xl xl:text-[0.875rem] xl:leading-relaxed ${isLightMode ? "text-black/65" : "text-white/65"}`}>
                        Get in touch with us for sponsorships, technical support, or any other inquiries related to the hackathon.
                    </p>
                </header>

                <section
                    className={`mt-6 min-h-0 flex-1 overflow-hidden border-[3px] transition-all duration-500 backdrop-blur-md ${isLightMode
                            ? "border-black/85 bg-[#eefcff]/72 shadow-[14px_14px_0_rgba(92,225,230,0.22)]"
                            : "border-black bg-black/38 shadow-[10px_10px_0_rgba(0,0,0,0.9)]"
                        } ${isModeAnimating ? (isLightMode ? "scale-[1.01]" : "scale-[0.99]") : "scale-100"}`}
                >
                    <div className="flex h-full flex-col overflow-hidden">
                        <div className={`shrink-0 border-b px-4 py-2 sm:px-5 xl:px-6 xl:py-3 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.34em] xl:text-xs ${isLightMode ? "text-black/50" : "text-white/55"}`}>Contact info</p>
                                    <h2
                                        className={`navbar-font text-2xl uppercase leading-none transition-all duration-300 sm:text-3xl xl:text-[2.2rem] ${
                                            isLightMode ? "text-black" : "text-white"
                                        }`}
                                        style={{ textShadow: `2px 2px 0 ${accent}` }}
                                    >
                                        Reach Us
                                    </h2>
                                </div>
                                <span
                                    className="pointer-events-auto inline-flex border-2 border-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black sm:px-4 xl:px-5 xl:py-2.5 xl:text-xs"
                                    style={{ backgroundColor: accent }}
                                >
                                    06 details
                                </span>
                            </div>

                        </div>

                        <div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4 xl:px-5 xl:py-5">
                            <div className="grid h-full items-stretch gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:gap-4">
                                <div className="grid h-full auto-rows-fr gap-2 sm:grid-cols-2 xl:gap-3">
                                    {contactCards.map((card, index) => (
                                        <div
                                            key={card.title}
                                            className={`h-full transition-all duration-500 ${isModeAnimating ? (isLightMode ? "scale-[1.02]" : "scale-[0.98]") : "scale-100"}`}
                                            style={{ transitionDelay: `${80 + index * 50}ms` }}
                                        >
                                            <ContactCard {...card} accent={accent} isLightMode={isLightMode} />
                                        </div>
                                    ))}
                                </div>

                                <aside
                                    className={`pointer-events-auto group flex h-full flex-col gap-2 border-2 p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 xl:gap-3 xl:p-4 ${
                                        isLightMode
                                            ? "border-black/15 bg-white/72 text-black shadow-[8px_8px_0_rgba(255,255,255,0.15)] hover:border-black/35 hover:bg-white/85"
                                            : "border-white/20 bg-black/55 text-white shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:border-white/50 hover:bg-black/70"
                                    } ${isModeAnimating ? (isLightMode ? "scale-[1.01]" : "scale-[0.99]") : "scale-100"}`}
                                >
                                    <div className={`border-b pb-2 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.34em] xl:text-[11px] ${isLightMode ? "text-black/50" : "text-white/55"}`}>Socials</p>
                                        <h3 className={`navbar-font mt-1 text-xl uppercase leading-none sm:text-2xl xl:text-[1.5rem] ${isLightMode ? "text-black" : "text-white"}`} style={{ textShadow: `2px 2px 0 ${accent}` }}>
                                            Follow Along
                                        </h3>
                                    </div>

                                    <div className="grid gap-2 flex-1">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center gap-3 border-2 h-full min-h-0 transition-all duration-300 hover:-translate-y-0.5 ${
                                                    isLightMode
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
                        </div>
                    </div>
                </section>

                <footer className="mt-3 flex shrink-0 flex-col items-center justify-between gap-3 sm:flex-row xl:mt-4">
                    <p className={`text-center text-xs sm:text-left xl:text-sm ${isLightMode ? "text-black/55" : "text-white/50"}`}>
                        For urgent matters, feel free to contact us through any of our channels.
                    </p>
                    <Link
                        href="/"
                        className="pointer-events-auto inline-flex items-center gap-2 border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 xl:px-5 xl:py-3 xl:text-sm"
                        style={{ backgroundColor: accent }}
                    >
                        Back to Home →
                    </Link>
                </footer>
            </main>
        </div>
    );
}
