import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ExternalLink, Plus, X, Volume2, VolumeX, Play, Pause } from "lucide-react";

// Local assets from the dashboard folder
const VIDEO_SRC = "/dashboard/dashboard-video.mp4";
const MUSIC_SRC = "/dashboard/Across_the_Clearing(music).mp3";
const LOGO_SRC  = "/dashboard/logo.png";

const SEARCH_ENGINES = [
  { id: "google",    name: "Google",    searchUrl: "https://www.google.com/search?q=",           icon: "G" },
  { id: "duckduckgo",name: "DuckDuckGo",searchUrl: "https://duckduckgo.com/?q=",                 icon: "D" },
  { id: "bing",      name: "Bing",      searchUrl: "https://www.bing.com/search?q=",              icon: "B" },
  { id: "ecosia",    name: "Ecosia",    searchUrl: "https://www.ecosia.org/search?q=",            icon: "E" },
  { id: "youtube",   name: "YouTube",   searchUrl: "https://www.youtube.com/results?search_query=",icon: "Y" },
];

interface Shortcut {
  id: string;
  title: string;
  url: string;
  icon: string; // monogram letter fallback
  iconUrl?: string; // resolved favicon URL
  color: string; // accent color (rgba string)
  side?: "left" | "right"; // dock side placement
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: "yt",      title: "YouTube",  url: "https://youtube.com",       icon: "▶",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://youtube.com&size=128", color: "rgba(255,0,0,0.6)", side: "left" },
  { id: "gh",      title: "GitHub",   url: "https://github.com",        icon: "⟨⟩", iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://github.com&size=128", color: "rgba(139,92,246,0.6)", side: "left" },
  { id: "gm",      title: "Gmail",    url: "https://mail.google.com",   icon: "✉",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com&size=128", color: "rgba(66,133,244,0.6)", side: "left" },
  { id: "gpt",     title: "ChatGPT",  url: "https://chatgpt.com",       icon: "◆",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://chatgpt.com&size=128", color: "rgba(16,163,127,0.6)", side: "left" },
  { id: "reddit",  title: "Reddit",   url: "https://reddit.com",        icon: "◎",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://reddit.com&size=128", color: "rgba(255,69,0,0.6)", side: "right" },
  { id: "twitter", title: "X",        url: "https://x.com",             icon: "𝕏",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://x.com&size=128", color: "rgba(255,255,255,0.4)", side: "right" },
  { id: "drive",   title: "Drive",    url: "https://drive.google.com",  icon: "△",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://drive.google.com&size=128", color: "rgba(52,168,83,0.6)", side: "right" },
  { id: "spotify", title: "Spotify",  url: "https://open.spotify.com",  icon: "♪",  iconUrl: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://spotify.com&size=128", color: "rgba(30,215,96,0.6)", side: "right" },
];

const NEON_COLORS = [
  "rgba(0, 255, 249, 0.6)",   // Cyber Cyan
  "rgba(255, 0, 193, 0.6)",   // Laser Magenta
  "rgba(139, 92, 246, 0.6)",  // Proton Violet
  "rgba(34, 197, 94, 0.6)",    // Acid Green
  "rgba(234, 179, 8, 0.6)",    // Grid Yellow
  "rgba(249, 115, 22, 0.6)",    // Flare Orange
];

// Helper to extract clean domain for favicons lookup
const getFaviconUrl = (urlStr: string) => {
  if (!urlStr) return "";
  try {
    const domain = urlStr.trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split('/')[0];
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
  } catch (e) {
    return "";
  }
};

// ---- Dynamic Shortcut Icon Component with Multi-Tier Fallback Resolving ----
function ShortcutIcon({ shortcut }: { shortcut: Shortcut }) {
  const [fallbackStep, setFallbackStep] = useState(shortcut.iconUrl ? 0 : 1);

  const domain = shortcut.url.trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split('/')[0];

  const getSrc = () => {
    switch (fallbackStep) {
      case 0:
        return shortcut.iconUrl || null;
      case 1:
        return `https://${domain}/favicon.ico`;
      case 2:
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      case 3:
        return `https://icon.horse/icon/${domain}`;
      default:
        return null;
    }
  };

  const src = getSrc();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        onError={() => {
          setFallbackStep((prev) => prev + 1);
        }}
        className="w-8 h-8 md:w-10 md:h-10 object-contain rounded"
        draggable={false}
      />
    );
  }

  return (
    <span
      className="transition-all duration-300 font-mono font-bold text-lg md:text-2xl"
      style={{ color: shortcut.color.replace(/[\d.]+\)$/, "1)"), filter: "brightness(1.2)" }}
    >
      {shortcut.icon}
    </span>
  );
}

// ---- Premium Varunix-Style Glitch Logo ----
function PremiumGlitchLogo() {
  return (
    <div className="glitch-logo-container select-none mb-16 md:mb-24 animate-fade-in-up">
      <div className="relative group cursor-pointer">
        {/* Main Base Logo */}
        <img
          src={LOGO_SRC}
          alt="Logo"
          className="glitch-logo-base h-48 md:h-64 w-auto object-contain z-10"
          style={{ filter: "drop-shadow(0 0 45px rgba(139,92,246,0.45))" }}
          draggable={false}
        />

        {/* CSS clip-path glitch overlays */}
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="glitch-logo-layer glitch-logo-cyan h-48 md:h-64 w-auto object-contain"
          draggable={false}
        />
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="glitch-logo-layer glitch-logo-magenta h-48 md:h-64 w-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Ambient glow behind logo */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          filter: "blur(32px)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ---- Floating Triangles Background ----
// anim variants assigned by index % 6
const TRI_ANIM_CLASSES = [
  "float-tri-rise",
  "float-tri-drift",
  "float-tri-pulse",
  "float-tri-orbit",
  "float-tri-bounce",
  "float-tri-zigzag",
];

interface TriDef {
  top: string;
  left?: string;
  right?: string;
  size: number;
  rot: number;
  color: string;
  dur: number;
  delay: number;
  glow?: boolean;
  outline?: boolean; // outline-only triangle
}

const TRIANGLE_DEFS: TriDef[] = [
  // ── Left column (close to shortcuts)
  { top:"4%",  left:"0.5%", size:22, rot: 15,  color:"rgba(139,92,246,0.22)",  dur:7.2,  delay:0,   glow:true  },
  { top:"10%", left:"5%",   size:10, rot:-25,  color:"rgba(0,210,255,0.16)",   dur:9.5,  delay:1.2             },
  { top:"17%", left:"1%",   size:28, rot: 40,  color:"rgba(217,70,239,0.10)",  dur:11.0, delay:0.5, outline:true },
  { top:"24%", left:"7%",   size:14, rot:-10,  color:"rgba(139,92,246,0.25)",  dur:8.3,  delay:2.1             },
  { top:"31%", left:"2%",   size:9,  rot: 60,  color:"rgba(0,240,255,0.14)",   dur:10.1, delay:0.8             },
  { top:"38%", left:"8%",   size:20, rot:-35,  color:"rgba(99,102,241,0.18)",  dur:6.8,  delay:3.0, glow:true  },
  { top:"44%", left:"3%",   size:8,  rot: 80,  color:"rgba(217,70,239,0.12)",  dur:13.5, delay:1.7             },
  { top:"51%", left:"6%",   size:16, rot:-50,  color:"rgba(139,92,246,0.15)",  dur:9.0,  delay:4.2             },
  { top:"57%", left:"1%",   size:24, rot: 22,  color:"rgba(0,210,255,0.09)",   dur:8.8,  delay:0.9, outline:true },
  { top:"63%", left:"9%",   size:11, rot:-70,  color:"rgba(217,70,239,0.20)",  dur:11.5, delay:2.6             },
  { top:"70%", left:"3%",   size:18, rot: 45,  color:"rgba(139,92,246,0.13)",  dur:7.5,  delay:1.1, glow:true  },
  { top:"76%", left:"7%",   size:7,  rot:-15,  color:"rgba(0,240,255,0.11)",   dur:9.8,  delay:3.7             },
  { top:"83%", left:"1.5%", size:20, rot: 55,  color:"rgba(99,102,241,0.17)",  dur:12.0, delay:0.4             },
  { top:"89%", left:"5%",   size:13, rot:-80,  color:"rgba(217,70,239,0.14)",  dur:10.5, delay:5.1             },
  { top:"95%", left:"2%",   size:26, rot: 30,  color:"rgba(139,92,246,0.08)",  dur:14.0, delay:1.9, outline:true },
  // ── Left column (further out, secondary layer)
  { top:"6%",  left:"11%",  size:8,  rot: 10,  color:"rgba(0,210,255,0.08)",   dur:15.0, delay:2.3             },
  { top:"28%", left:"12%",  size:12, rot:-45,  color:"rgba(217,70,239,0.09)",  dur:11.8, delay:3.8             },
  { top:"55%", left:"13%",  size:9,  rot: 75,  color:"rgba(99,102,241,0.10)",  dur:13.2, delay:0.7             },
  { top:"78%", left:"11%",  size:15, rot:-30,  color:"rgba(139,92,246,0.11)",  dur:9.3,  delay:4.5             },
  { top:"92%", left:"14%",  size:7,  rot: 95,  color:"rgba(0,240,255,0.07)",   dur:16.0, delay:2.0             },
  // ── Tiny accent triangles far left edge
  { top:"33%", left:"0.2%", size:6,  rot: 20,  color:"rgba(217,70,239,0.28)",  dur:5.5,  delay:0.2, glow:true  },
  { top:"61%", left:"0.2%", size:5,  rot:-55,  color:"rgba(0,240,255,0.25)",   dur:6.2,  delay:1.5, glow:true  },
  { top:"13%", left:"0.2%", size:7,  rot: 88,  color:"rgba(139,92,246,0.22)",  dur:7.0,  delay:3.3, glow:true  },
  { top:"87%", left:"0.2%", size:6,  rot:-12,  color:"rgba(99,102,241,0.24)",  dur:5.8,  delay:4.1, glow:true  },
  // ── Right column (close to shortcuts)
  { top:"4%",  right:"0.5%",size:20, rot:-20,  color:"rgba(217,70,239,0.20)",  dur:8.8,  delay:0.3, glow:true  },
  { top:"10%", right:"5%",  size:11, rot: 35,  color:"rgba(0,210,255,0.14)",   dur:11.2, delay:2.5             },
  { top:"17%", right:"1%",  size:26, rot:-45,  color:"rgba(139,92,246,0.09)",  dur:7.5,  delay:1.0, outline:true },
  { top:"24%", right:"7%",  size:14, rot: 70,  color:"rgba(99,102,241,0.16)",  dur:9.8,  delay:3.5             },
  { top:"31%", right:"2%",  size:18, rot:-15,  color:"rgba(217,70,239,0.13)",  dur:12.0, delay:0.6             },
  { top:"38%", right:"8%",  size:8,  rot: 55,  color:"rgba(0,240,255,0.11)",   dur:7.0,  delay:2.8, glow:true  },
  { top:"44%", right:"3%",  size:22, rot:-65,  color:"rgba(139,92,246,0.16)",  dur:10.5, delay:1.4             },
  { top:"51%", right:"6%",  size:7,  rot: 90,  color:"rgba(217,70,239,0.10)",  dur:14.0, delay:4.8             },
  { top:"57%", right:"1%",  size:25, rot:-30,  color:"rgba(99,102,241,0.08)",  dur:9.2,  delay:0.5, outline:true },
  { top:"63%", right:"9%",  size:12, rot: 40,  color:"rgba(0,210,255,0.15)",   dur:8.6,  delay:3.2             },
  { top:"70%", right:"3%",  size:16, rot:-80,  color:"rgba(139,92,246,0.19)",  dur:11.8, delay:1.6, glow:true  },
  { top:"76%", right:"7%",  size:9,  rot: 25,  color:"rgba(217,70,239,0.12)",  dur:7.4,  delay:2.9             },
  { top:"83%", right:"1.5%",size:21, rot:-50,  color:"rgba(0,240,255,0.08)",   dur:13.0, delay:0.8             },
  { top:"89%", right:"5%",  size:13, rot: 60,  color:"rgba(99,102,241,0.13)",  dur:10.2, delay:5.5             },
  { top:"95%", right:"2%",  size:24, rot:-10,  color:"rgba(139,92,246,0.07)",  dur:15.5, delay:2.2, outline:true },
  // ── Right column (further out, secondary layer)
  { top:"6%",  right:"11%", size:9,  rot: 15,  color:"rgba(0,210,255,0.09)",   dur:14.5, delay:1.8             },
  { top:"28%", right:"12%", size:11, rot:-35,  color:"rgba(217,70,239,0.10)",  dur:12.3, delay:4.0             },
  { top:"55%", right:"13%", size:8,  rot: 65,  color:"rgba(99,102,241,0.11)",  dur:10.7, delay:0.6             },
  { top:"78%", right:"11%", size:14, rot:-25,  color:"rgba(139,92,246,0.12)",  dur:8.9,  delay:3.9             },
  { top:"92%", right:"14%", size:6,  rot: 85,  color:"rgba(0,240,255,0.08)",   dur:17.0, delay:1.3             },
  // ── Tiny accent triangles far right edge
  { top:"33%", right:"0.2%",size:6,  rot:-20,  color:"rgba(217,70,239,0.28)",  dur:5.5,  delay:0.9, glow:true  },
  { top:"61%", right:"0.2%",size:5,  rot: 55,  color:"rgba(0,240,255,0.25)",   dur:6.2,  delay:2.4, glow:true  },
  { top:"13%", right:"0.2%",size:7,  rot:-88,  color:"rgba(139,92,246,0.22)",  dur:7.0,  delay:3.8, glow:true  },
  { top:"87%", right:"0.2%",size:6,  rot: 12,  color:"rgba(99,102,241,0.24)",  dur:5.8,  delay:0.5, glow:true  },
];

function FloatingTriangles() {
  return (
    <div className="floating-triangles-layer" aria-hidden>
      {TRIANGLE_DEFS.map((t, i) => {
        const animClass = TRI_ANIM_CLASSES[i % TRI_ANIM_CLASSES.length];
        const posStyle: React.CSSProperties = {
          position: "absolute",
          top: t.top,
          ...(t.left  ? { left:  t.left  } : {}),
          ...(t.right ? { right: t.right } : {}),
          animationName: animClass,
          animationDuration: `${t.dur}s`,
          animationDelay: `${t.delay}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationFillMode: "both",
          filter: t.glow
            ? `drop-shadow(0 0 5px ${t.color.replace(/,[\d.]+\)$/, ",0.9)")})`
            : "none",
        };
        const strokeColor = t.color.replace(/,[\d.]+\)$/, t.outline ? ",0.7)" : ",0.45)");
        const fillColor   = t.outline ? "none" : t.color;

        return (
          <div key={i} className="float-tri" style={posStyle}>
            <svg
              width={t.size * 2}
              height={t.size * 2}
              viewBox="0 0 20 20"
              fill="none"
              style={{ transform: `rotate(${t.rot}deg)`, display: "block" }}
            >
              <polygon
                points="10,1 19,18 1,18"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={t.outline ? "1.2" : "0.8"}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

interface RobotCompanionProps {
  isFocused: boolean;
  query: string;
  isSubmitting: boolean;
}

const ROBOT_FRAMES = {
  left: [
    "/dashboard/walking/r3_c1.png",
    "/dashboard/walking/r3_c2.png",
    "/dashboard/walking/r3_c3.png",
    "/dashboard/walking/r3_c4.png",
  ],
  idle: [
    "/dashboard/walking/r2_c1.png",
    "/dashboard/walking/r2_c2.png",
    "/dashboard/walking/r2_c3.png",
    "/dashboard/walking/r2_c4.png",
  ],
  right: [
    "/dashboard/walking/r1_c1.png",
    "/dashboard/walking/r1_c2.png",
    "/dashboard/walking/r1_c3.png",
    "/dashboard/walking/r1_c4.png",
  ],
  special: [
    "/dashboard/walking/r4_c1.png",
    "/dashboard/walking/r4_c2.png",
    "/dashboard/walking/r4_c3.png",
    "/dashboard/walking/r4_c4.png",
  ],
};

function RobotCompanion({ isFocused, query, isSubmitting }: RobotCompanionProps) {
  const [posX, setPosX] = useState(15); // Start at left (15%)
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [frameIdx, setFrameIdx] = useState(0);

  // Preload all frames to avoid flashing
  useEffect(() => {
    Object.values(ROBOT_FRAMES).flat().forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Frame tick interval (slow, steady walk rate)
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % 4);
    }, 150); // Steady 150ms per frame

    return () => clearInterval(frameInterval);
  }, []);

  // Movement tick interval
  useEffect(() => {
    if (isSubmitting) return; // Special animation takes over

    const moveInterval = setInterval(() => {
      setPosX((p) => {
        if (direction === "right") {
          const next = p + 0.15; // Slow, steady increment
          if (next >= 80) {
            setDirection("left");
            return 80;
          }
          return next;
        } else {
          const next = p - 0.15; // Slow, steady decrement
          if (next <= 15) {
            setDirection("right");
            return 15;
          }
          return next;
        }
      });
    }, 40); // 40ms updates for smooth movement

    return () => clearInterval(moveInterval);
  }, [direction, isSubmitting]);

  const activeFrames = isSubmitting ? ROBOT_FRAMES.special : ROBOT_FRAMES[direction];
  const activeFrameSrc = activeFrames[frameIdx] || activeFrames[0];

  return (
    <div
      className="absolute pointer-events-none select-none z-40 transition-transform duration-300 ease-out"
      style={{
        left: `${posX}%`,
        bottom: "100%",
        transform: "translate(-50%, 4px)",
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
      }}
    >
      <div className="relative">
        <img
          src={activeFrameSrc}
          alt="Robot"
          className="w-10 h-10 object-contain"
          draggable={false}
        />
        {/* Subtle holographic glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/8 to-transparent mix-blend-overlay pointer-events-none" />
      </div>
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchEngineId, setSearchEngineId] = useState<string>(
    () => localStorage.getItem("search_engine") || "google"
  );
  const [searchEngineDropdownOpen, setSearchEngineDropdownOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Audio state
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3);

  // Shortcuts state
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem("custom_shortcuts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Shortcut[];
        // Backwards compatibility / migration to side placement
        return parsed.map((s, idx) => {
          const side = s.side || (idx < Math.ceil(parsed.length / 2) ? "left" : "right");
          const iconUrl = s.iconUrl || (s.url ? getFaviconUrl(s.url) : undefined);
          return { ...s, iconUrl, side };
        });
      } catch (e) {
        return DEFAULT_SHORTCUTS;
      }
    }
    return DEFAULT_SHORTCUTS;
  });

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newShortcutName, setNewShortcutName] = useState<string>("");
  const [newShortcutUrl, setNewShortcutUrl] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(NEON_COLORS[0]);
  const [targetSide, setTargetSide] = useState<"left" | "right">("left");
  const [customIconUrl, setCustomIconUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus search bar on load + video/audio init
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    const initAudio = () => {
      if (audioRef.current && !audioStarted) {
        audioRef.current.volume = volume;
        audioRef.current.play()
          .then(() => {
            setAudioStarted(true);
            setAudioPlaying(true);
            document.removeEventListener("click", initAudio);
            document.removeEventListener("keydown", initAudio);
          })
          .catch(() => {});
      }
    };

    document.addEventListener("click", initAudio);
    document.addEventListener("keydown", initAudio);

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, [audioStarted, volume]);

  useEffect(() => {
    localStorage.setItem("search_engine", searchEngineId);
  }, [searchEngineId]);

  useEffect(() => {
    localStorage.setItem("custom_shortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500); // 1.5s victory dance
    const engine = SEARCH_ENGINES.find((se) => se.id === searchEngineId) || SEARCH_ENGINES[0];
    window.open(`${engine.searchUrl}${encodeURIComponent(searchQuery.trim())}`, "_blank");
    setSearchQuery("");
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.volume = nextMuted ? 0 : volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.volume = newVol;
    } else {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
  };

  const handleAddShortcutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutName.trim() || !newShortcutUrl.trim()) return;

    let url = newShortcutUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const firstChar = newShortcutName.trim().charAt(0).toUpperCase() || "★";
    const iconUrl = customIconUrl.trim() || getFaviconUrl(url);

    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      title: newShortcutName.trim(),
      url,
      icon: firstChar,
      iconUrl,
      color: selectedColor,
      side: targetSide,
    };

    setShortcuts([...shortcuts, newShortcut]);
    setNewShortcutName("");
    setNewShortcutUrl("");
    setCustomIconUrl("");
    setIsAddModalOpen(false);
  };

  const handleDeleteShortcut = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShortcuts(shortcuts.filter((s) => s.id !== id));
  };

  const selectedEngine = SEARCH_ENGINES.find((se) => se.id === searchEngineId) || SEARCH_ENGINES[0];

  // Filter shortcuts by left/right side docks
  const leftShortcuts = shortcuts.filter((s) => s.side === "left");
  const rightShortcuts = shortcuts.filter((s) => s.side !== "left");

  return (
    <main
      id="main-container"
      className="relative w-screen h-screen overflow-hidden select-none bg-[#020205]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Background Video (muted, loop, contain fit) ── */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-contain z-0"
        style={{ opacity: 0.75, filter: "brightness(0.8) saturate(1.1)" }}
      />

      {/* ── Dark gradient overlay ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,2,6,0.3) 0%, rgba(2,2,6,0.15) 50%, rgba(2,2,6,0.45) 100%)",
        }}
      />

      {/* ── Ambient radial glows ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div
          style={{
            position: "absolute", top: "20%", left: "10%",
            width: "550px", height: "550px",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "10%", right: "10%",
            width: "600px", height: "600px",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* ── Audio (loop) ── */}
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />

      {/* ── HUD Music Controller ── */}
      <div
        className="fixed top-5 right-5 z-30 flex items-center gap-3 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 select-none hover:border-purple-500/40"
        style={{
          background: "rgba(10, 10, 24, 0.45)",
          borderColor: "rgba(139,92,246,0.2)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Equalizer animation */}
        <div className="flex items-end gap-[3px] h-3 w-5 mr-1 pointer-events-none">
          <div className={`w-[2px] bg-cyan-400 rounded-full transition-all duration-300 ${audioPlaying && !isMuted ? "animate-eq-bar-1" : "h-[3px]"}`} style={{ height: audioPlaying && !isMuted ? undefined : "3px" }} />
          <div className={`w-[2px] bg-purple-400 rounded-full transition-all duration-300 ${audioPlaying && !isMuted ? "animate-eq-bar-2" : "h-[6px]"}`} style={{ height: audioPlaying && !isMuted ? undefined : "6px" }} />
          <div className={`w-[2px] bg-pink-500 rounded-full transition-all duration-300 ${audioPlaying && !isMuted ? "animate-eq-bar-3" : "h-[4px]"}`} style={{ height: audioPlaying && !isMuted ? undefined : "4px" }} />
          <div className={`w-[2px] bg-emerald-400 rounded-full transition-all duration-300 ${audioPlaying && !isMuted ? "animate-eq-bar-4" : "h-[2px]"}`} style={{ height: audioPlaying && !isMuted ? undefined : "2px" }} />
        </div>

        {/* Music Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlay}
            className="p-1 rounded bg-transparent border-none text-slate-400 hover:text-white cursor-pointer transition-colors duration-200"
            title={audioPlaying ? "Pause Ambience" : "Play Ambience"}
          >
            {audioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-1 rounded bg-transparent border-none text-slate-400 hover:text-white cursor-pointer transition-colors duration-200"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none transition-all"
            style={{ outline: "none" }}
          />
        </div>
      </div>

      {/* ── Center Content: Logo + Custom Double-Border Search Bar (CSS animation entry) ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Logo */}
        <PremiumGlitchLogo />

        {/* HUD Tech Info Panel */}
        <div className={`search-hud-info animate-fade-in-up-delay-1${searchFocused ? " focused" : ""}`}>
          <span className="left-info">SYS_STATUS // ONLINE_SECURE</span>
          <span className="right-info">NODE_LATENCY // 0.08ms</span>
        </div>

        {/* Search Bar Wrapper */}
        <div className={`cyber-search-wrapper animate-fade-in-up-delay-1 z-30 ${searchFocused ? "focused" : ""}`}>
          {/* Robot Companion */}
          <RobotCompanion isFocused={searchFocused} query={searchQuery} isSubmitting={isSubmitting} />

          {/* HUD Corner Brackets */}
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />

          {/* Old accent tabs — hidden by CSS */}
          <div className="cyber-search-outer-outline" />

          {/* Inner Capsule */}
          <div className="cyber-search-inner-capsule">
            <form id="search-form" onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", width: "100%", gap: 0 }}>

              {/* Engine Selector */}
              <div className="relative flex items-center shrink-0" style={{ marginRight: "8px" }}>
                <button
                  id="btn-engine-selector"
                  type="button"
                  className="engine-selector-btn"
                  onClick={() => setSearchEngineDropdownOpen(!searchEngineDropdownOpen)}
                >
                  <Search
                    style={{
                      width: 15, height: 15,
                      color: searchFocused ? "rgba(0, 240, 255, 0.85)" : "rgba(255,255,255,0.38)",
                      transition: "color 0.25s",
                    }}
                  />
                  <span className="engine-icon-badge">
                    <img
                      src={getFaviconUrl(selectedEngine.searchUrl)}
                      alt=""
                      className="w-[14px] h-[14px] object-contain rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.nextElementSibling;
                        if (fb) (fb as HTMLElement).style.display = "inline";
                      }}
                    />
                    <span className="engine-fallback" style={{ display: "none" }}>
                      {selectedEngine.icon}
                    </span>
                  </span>
                  <ChevronDown
                    style={{
                      width: 12, height: 12,
                      color: "rgba(255,255,255,0.28)",
                      transform: searchEngineDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {/* Engine Dropdown */}
                {searchEngineDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSearchEngineDropdownOpen(false)} />
                    <div className="engine-dropdown">
                      <span className="engine-dropdown-label">Engine</span>
                      <div className="engine-dropdown-list">
                        {SEARCH_ENGINES.map((se) => (
                          <button
                            key={se.id}
                            type="button"
                            className={`engine-dropdown-item${searchEngineId === se.id ? " selected" : ""}`}
                            onClick={() => {
                              setSearchEngineId(se.id);
                              setSearchEngineDropdownOpen(false);
                            }}
                          >
                            <span className="engine-item-icon">
                              <img
                                src={getFaviconUrl(se.searchUrl)}
                                alt=""
                                className="w-4 h-4 object-contain rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fb = e.currentTarget.nextElementSibling;
                                  if (fb) (fb as HTMLElement).style.display = "inline";
                                }}
                              />
                              <span className="engine-fallback" style={{ display: "none" }}>
                                {se.icon}
                              </span>
                            </span>
                            <span>{se.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Search Input */}
              <input
                id="search-input"
                ref={searchInputRef}
                type="text"
                placeholder="Search everything... or start typing a creative prompt like 'Across the Clearing...'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                autoComplete="off"
                spellCheck={false}
              />

              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 26, height: 26, borderRadius: "50%",
                    border: "none", background: "transparent",
                    color: "rgba(255,255,255,0.35)", cursor: "pointer",
                    flexShrink: 0, marginRight: 4,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}

              {/* Music/Wave Loader */}
              <div className="search-audio-loader" aria-hidden="true">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                className={`enter-btn${searchQuery.trim() ? " active" : ""}`}
                tabIndex={searchQuery.trim() ? 0 : -1}
                aria-label="Search"
              >
                ↵
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Floating Triangles (behind shortcuts) ── */}
      <FloatingTriangles />

      {/* ── DESKTOP SHORTCUT SIDEBARS (Left & Right Balanced columns in black margins) ── */}
      
      {/* 1. Left Sidebar (Left dock of shortcuts + Add button) */}
      <div
        className="hidden md:flex fixed z-30 left-8 top-1/2 -translate-y-1/2 flex-col gap-5 animate-fade-in-up-delay-2"
      >
        {leftShortcuts.map((shortcut, i) => (
          <a
            key={shortcut.id}
            href={shortcut.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shortcut-card group flex flex-col items-center justify-center no-underline relative w-20"
          >
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => handleDeleteShortcut(e, shortcut.id)}
              className="absolute top-[-4px] right-[6px] w-5 h-5 rounded-full bg-slate-950 border border-red-500/40 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-30 shadow-md"
              title="Remove shortcut"
            >
              <X className="w-3 h-3" />
            </button>

            {/* SQUIRCLE container */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden bg-slate-900/60 border border-slate-700/30 group-hover:border-purple-500/40"
              style={{ boxShadow: `0 6px 16px rgba(0,0,0,0.5)` }}
            >
              <ShortcutIcon shortcut={shortcut} />
            </div>

            {/* Hover slide-out label (slides to the RIGHT on left sidebar) */}
            <span className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-950/95 border border-purple-500/30 text-white text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              {shortcut.title}
            </span>
          </a>
        ))}

        {/* Plus (+) Button on the left sidebar */}
        <button
          type="button"
          onClick={() => {
            setTargetSide("left");
            setCustomIconUrl("");
            setIsAddModalOpen(true);
          }}
          className="shortcut-card group flex flex-col items-center justify-center no-underline cursor-pointer relative w-20"
          title="Add Shortcut"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-dashed border-purple-500/30 bg-purple-950/5 text-purple-400 group-hover:text-purple-300 group-hover:border-purple-400/60 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]">
            <Plus className="w-8 h-8" />
          </div>

          {/* Hover slide-out label (slides to the RIGHT) */}
          <span className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-950/95 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            Add Shortcut
          </span>
        </button>
      </div>

      {/* 2. Right Sidebar (Right dock of shortcuts + Add button) */}
      <div
        className="hidden md:flex fixed z-30 right-8 top-1/2 -translate-y-1/2 flex-col gap-5 animate-fade-in-up-delay-2"
      >
        {rightShortcuts.map((shortcut, i) => (
          <a
            key={shortcut.id}
            href={shortcut.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shortcut-card group flex flex-col items-center justify-center no-underline relative w-20"
          >
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => handleDeleteShortcut(e, shortcut.id)}
              className="absolute top-[-4px] right-[6px] w-5 h-5 rounded-full bg-slate-950 border border-red-500/40 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-30 shadow-md"
              title="Remove shortcut"
            >
              <X className="w-3 h-3" />
            </button>

            {/* SQUIRCLE container */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden bg-slate-900/60 border border-slate-700/30 group-hover:border-purple-500/40"
              style={{ boxShadow: `0 6px 16px rgba(0,0,0,0.5)` }}
            >
              <ShortcutIcon shortcut={shortcut} />
            </div>

            {/* Hover slide-out label (slides to the LEFT on right sidebar) */}
            <span className="absolute right-full mr-4 px-2 py-1 rounded bg-slate-950/95 border border-purple-500/30 text-white text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              {shortcut.title}
            </span>
          </a>
        ))}

        {/* Plus (+) Button on the right sidebar */}
        <button
          type="button"
          onClick={() => {
            setTargetSide("right");
            setCustomIconUrl("");
            setIsAddModalOpen(true);
          }}
          className="shortcut-card group flex flex-col items-center justify-center no-underline cursor-pointer relative w-20"
          title="Add Shortcut"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-dashed border-purple-500/30 bg-purple-950/5 text-purple-400 group-hover:text-purple-300 group-hover:border-purple-400/60 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]">
            <Plus className="w-8 h-8" />
          </div>

          {/* Hover slide-out label (slides to the LEFT) */}
          <span className="absolute right-full mr-4 px-2 py-1 rounded bg-slate-950/95 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            Add Shortcut
          </span>
        </button>
      </div>

      {/* ── MOBILE ONLY BOTTOM DOCK (Unified row at bottom) ── */}
      <div
        className="flex md:hidden fixed z-30 bottom-6 left-1/2 -translate-x-1/2 flex-row gap-3 items-center justify-center animate-fade-in-up-delay-2"
      >
        {shortcuts.map((shortcut) => (
          <a
            key={shortcut.id}
            href={shortcut.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shortcut-card group flex flex-col items-center justify-center no-underline relative w-16"
          >
            <button
              type="button"
              onClick={(e) => handleDeleteShortcut(e, shortcut.id)}
              className="absolute top-[-4px] right-[-4px] w-5 h-5 rounded-full bg-slate-950 border border-red-500/40 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-30 shadow-md"
            >
              <X className="w-3 h-3" />
            </button>

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden bg-slate-900/60 border border-slate-700/30"
              style={{ boxShadow: `0 4px 12px rgba(0,0,0,0.45)` }}
            >
              <ShortcutIcon shortcut={shortcut} />
            </div>

            <span className="block text-[9px] font-light tracking-wide truncate max-w-[60px] text-center text-slate-400 mt-1">
              {shortcut.title}
            </span>
          </a>
        ))}

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="shortcut-card group flex flex-col items-center justify-center no-underline cursor-pointer relative w-16"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 border border-dashed border-purple-500/30 bg-purple-950/5 text-purple-400 group-hover:text-purple-300">
            <Plus className="w-6 h-6" />
          </div>
          <span className="block text-[9px] font-light tracking-wide text-purple-400/60 group-hover:text-purple-300 mt-1">
            Add Link
          </span>
        </button>
      </div>

      {/* ── Add Shortcut Dialog Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md">
          {/* Modal backdrop closer */}
          <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)} />

          <div
            className="relative w-full max-w-xs overflow-hidden p-5 rounded-xl border animate-fade-in-up"
            style={{
              background: "rgba(8,8,22,0.95)",
              borderColor: "rgba(139,92,246,0.3)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.8), 0 0 20px rgba(139,92,246,0.15)",
            }}
          >
            {/* HUD corners */}
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />

            <div className="flex justify-between items-center mb-4 pb-2 border-b border-purple-500/10">
              <h3 className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                Add Shortcut
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddShortcutSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-purple-500/20 focus:border-purple-400 rounded-lg px-3 py-2 text-xs font-light text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                  URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. github.com"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-purple-500/20 focus:border-purple-400 rounded-lg px-3 py-2 text-xs font-light text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                  Side Placement
                </label>
                <div className="flex gap-2">
                  <button
                    key="side-left"
                    type="button"
                    onClick={() => setTargetSide("left")}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono transition-all duration-200 cursor-pointer ${
                      targetSide === "left"
                        ? "bg-purple-500/20 border-purple-400 text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        : "bg-slate-950/40 border-purple-500/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Left Side
                  </button>
                  <button
                    key="side-right"
                    type="button"
                    onClick={() => setTargetSide("right")}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono transition-all duration-200 cursor-pointer ${
                      targetSide === "right"
                        ? "bg-purple-500/20 border-purple-400 text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        : "bg-slate-950/40 border-purple-500/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Right Side
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                  Icon URL (Optional Override)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://site.com/logo.png"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-purple-500/20 focus:border-purple-400 rounded-lg px-3 py-2 text-xs font-light text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest mb-2">
                  Accent Color
                </label>
                <div className="flex justify-between gap-1.5">
                  {NEON_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 rounded-full border transition-all duration-200 cursor-pointer ${
                        selectedColor === col
                          ? "scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                          : "border-transparent"
                      }`}
                      style={{
                        background: col,
                        boxShadow: selectedColor === col ? `0 0 10px ${col}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 mt-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-300 cursor-pointer border-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.65; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;    transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>
    </main>
  );
}
