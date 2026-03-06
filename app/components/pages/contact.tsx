import React from "react";
import type { ReactNode } from "react";
import type { PageDefinition } from "./types";

// ── Reusable inline styles ─────────────────────────────────────────────────────
const iconWrap: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10,
  background: "rgba(99,179,237,0.12)",
  border: "1px solid rgba(99,179,237,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 12,
};

const divider: React.CSSProperties = {
  width: "100%", height: 1,
  background: "rgba(255,255,255,0.06)",
  margin: "2px 0",
};

// ── Icon SVGs ─────────────────────────────────────────────────────────────────
function EmailIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#93c5fd" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#93c5fd" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="#93c5fd" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ── Header cube content ────────────────────────────────────────────────────────
const headerContent: ReactNode = (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", width: "100%", height: "100%", gap: 8,
    padding: "0 32px", textAlign: "center",
  }}>
    <p style={{
      fontSize: 11, letterSpacing: "0.3em", color: "rgba(147,197,253,0.6)",
      textTransform: "uppercase", fontFamily: "monospace", margin: 0,
    }}>
      Contact
    </p>
    <h1 style={{
      fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 900, margin: 0,
      letterSpacing: "-0.02em", lineHeight: 1.1,
      background: "linear-gradient(135deg, #93c5fd 0%, #818cf8 60%, #c4b5fd 100%)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>
      Get In Touch
    </h1>
    <p style={{
      fontSize: "clamp(11px, 1.1vw, 14px)", color: "rgba(148,163,184,0.9)",
      maxWidth: 380, margin: 0, lineHeight: 1.6,
    }}>
      Reach out via the details below or send us a message directly.
    </p>
  </div>
);

// ── Contact Info cube content ──────────────────────────────────────────────────
const contactInfoContent: ReactNode = (
  <div style={{
    display: "flex", flexDirection: "column", width: "100%", height: "100%",
    padding: "20px 24px", gap: 14, boxSizing: "border-box",
  }}>
    <p style={{
      fontSize: 10, letterSpacing: "0.3em", color: "rgba(147,197,253,0.5)",
      textTransform: "uppercase", fontFamily: "monospace", margin: 0,
    }}>
      Contact Info
    </p>

    <div style={divider} />

    {/* Phone */}
    <div style={rowStyle}>
      <div style={iconWrap}><PhoneIcon /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{
          fontSize: 10, color: "rgba(100,116,139,1)", textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}>Phone</span>
        <span style={{
          fontSize: "clamp(11px, 1vw, 14px)", color: "#e2e8f0", fontWeight: 500,
        }}>+91 00000 00000</span>
      </div>
    </div>

    <div style={divider} />

    {/* Email */}
    <div style={rowStyle}>
      <div style={iconWrap}><EmailIcon /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{
          fontSize: 10, color: "rgba(100,116,139,1)", textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}>Email</span>
        <span style={{
          fontSize: "clamp(11px, 1vw, 14px)", color: "#e2e8f0", fontWeight: 500,
        }}>placeholder@email.com</span>
      </div>
    </div>

    <div style={divider} />

    {/* Address */}
    <div style={rowStyle}>
      <div style={iconWrap}><PinIcon /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{
          fontSize: 10, color: "rgba(100,116,139,1)", textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}>Address</span>
        <span style={{
          fontSize: "clamp(10px, 0.9vw, 13px)", color: "#93c5fd",
          fontWeight: 500, lineHeight: 1.6,
        }}>
          123 Placeholder Street,<br />
          City, State – 000000
        </span>
        <span style={{ fontSize: 10, color: "rgba(99,179,237,0.45)" }}>↗ Open in Maps</span>
      </div>
    </div>
  </div>
);

// ── Contact Form cube content ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, padding: "8px 12px",
  color: "#e2e8f0", fontSize: "clamp(10px, 0.85vw, 13px)",
  outline: "none", pointerEvents: "auto",
  fontFamily: "inherit",
};

const sendMessageContent: ReactNode = (
  <div style={{
    display: "flex", flexDirection: "column", width: "100%", height: "100%",
    padding: "20px 24px", gap: 10, boxSizing: "border-box",
  }}>
    <p style={{
      fontSize: 10, letterSpacing: "0.3em", color: "rgba(129,140,248,0.5)",
      textTransform: "uppercase", fontFamily: "monospace", margin: 0,
    }}>
      Send a Message
    </p>

    <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} />

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{
          fontSize: 9, color: "rgba(100,116,139,1)",
          textTransform: "uppercase", letterSpacing: "0.15em",
        }}>Name</label>
        <input type="text" placeholder="Your name"
          style={{ ...inputStyle }}
          onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{
          fontSize: 9, color: "rgba(100,116,139,1)",
          textTransform: "uppercase", letterSpacing: "0.15em",
        }}>Email</label>
        <input type="email" placeholder="your@email.com"
          style={{ ...inputStyle }}
          onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{
        fontSize: 9, color: "rgba(100,116,139,1)",
        textTransform: "uppercase", letterSpacing: "0.15em",
      }}>Subject</label>
      <input type="text" placeholder="What's this about?"
        style={{ ...inputStyle }}
        onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <label style={{
        fontSize: 9, color: "rgba(100,116,139,1)",
        textTransform: "uppercase", letterSpacing: "0.15em",
      }}>Message</label>
      <textarea placeholder="Tell us more..."
        style={{ ...inputStyle, resize: "none", flex: 1, minHeight: 60 }}
        onFocus={e => { e.target.style.borderColor = "rgba(129,140,248,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
    </div>

    <button
      type="button"
      style={{
        width: "100%", padding: "10px 16px",
        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
        border: "none", borderRadius: 8, color: "#fff",
        fontSize: "clamp(10px, 0.85vw, 13px)", fontWeight: 700,
        cursor: "pointer", pointerEvents: "auto",
        letterSpacing: "0.05em", display: "flex",
        alignItems: "center", justifyContent: "center", gap: 6,
        boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
      }}
    >
      Send Message
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
);

// ── Page definition ────────────────────────────────────────────────────────────
const contactPage: PageDefinition = {
  layout: [
    {
      // Header — wide strip
      row: 2,
      col: 4,
      rowSpan: 4,
      colSpan: 20,
      color: "blue",
      content: headerContent,
    },
    {
      // Contact Info — left block
      row: 7,
      col: 4,
      rowSpan: 13,
      colSpan: 9,
      color: "maroon",
      content: contactInfoContent,
    },
    {
      // Contact Form — right block
      row: 7,
      col: 14,
      rowSpan: 13,
      colSpan: 10,
      color: "purple",
      content: sendMessageContent,
    },
  ],
};

export default contactPage;
