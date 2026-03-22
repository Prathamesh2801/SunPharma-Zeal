import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Users } from "lucide-react";
import SunLogo from "../assets/img/SunPharmaLogo.png";
import ArianLogo from "../assets/img/ArianLogo.png";
import RiseLogo from "../assets/img/RiseLogo.png";
import HighspeedFont from "../assets/fonts/HighspeedRegular-8MrOn.otf";
import { BASE_URL } from "../../config";

const SSE_URL = `${BASE_URL}/sse_api.php`;
const GRID_COLS = 9;
const GRID_ROWS = 5;
const TOTAL = GRID_COLS * GRID_ROWS;
const LS_KEY = "sp_tv_cells";

// ── Design tokens ────────────────────────────────────────────
const T = {
  surface0: "#FFFFFF",
  surface50: "#FBF8F5",
  surface100: "#F5EFE7",
  surface200: "#EDE4D8",
  brand50: "#FFF5EB",
  brand200: "#FFC88A",
  brand300: "#FFA54F",
  brand400: "#FF8724",
  brand500: "#E8731A",
  brand600: "#C45A0C",
  inkPrimary: "#1C1611",
  inkSecondary: "#4A3728",
  inkTertiary: "#7D6A56",
  success: "#2D7D46",
  successSubtle: "#E8F5ED",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const imgUrl = (path) => (path ? `${BASE_URL}/${path}` : null);

const loadCells = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};
const saveCells = (c) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(c));
  } catch {}
};

// ─────────────────────────────────────────────────────────────
//  phase:
//   "idle"    — nothing showing
//   "modal"   — full-size card centered on screen
//   "flying"  — card animating from center → target cell
// ─────────────────────────────────────────────────────────────

export default function TVDisplay() {
  const [cells, setCells] = useState(loadCells);
  const [phase, setPhase] = useState("idle"); // "idle"|"modal"|"flying"
  const [liveEntry, setLiveEntry] = useState(null);
  const [connected, setConnected] = useState(false);
  const [pulse, setPulse] = useState(false);

  // target cell index for current entry
  const targetIdxRef = useRef(null);
  // ref map: cellIndex → DOM element
  const cellRefs = useRef({});
  // pending entry waiting to be written to cells after fly lands
  const pendingEntry = useRef(null);
  // stored rect of the target cell (captured just before fly starts)
  const [targetRect, setTargetRect] = useState(null);

  const esRef = useRef(null);
  const idleTimerRef = useRef(null);

  const getNextCell = useCallback((currentCells) => {
    for (let i = 0; i < TOTAL; i++) {
      if (!currentCells[i]) return i;
    }
    return 0; // all full → reset
  }, []);

  // ── Dismiss: capture cell rect then start fly phase ───────
  const startFly = useCallback(() => {
    const idx = targetIdxRef.current;
    const el = cellRefs.current[idx];
    if (!el) {
      // fallback — fill immediately if no DOM ref
      const entry = pendingEntry.current;
      if (entry !== null && idx !== null) {
        setCells((prev) => {
          const filled = Object.keys(prev).length;
          const base = filled >= TOTAL ? {} : { ...prev };
          base[idx] = entry;
          saveCells(base);
          return base;
        });
        pendingEntry.current = null;
      }
      setPhase("idle");
      setLiveEntry(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setPhase("flying");
  }, []);

  // ── Called when fly animation completes ───────────────────
  const onFlyComplete = useCallback(() => {
    const idx = targetIdxRef.current;
    const entry = pendingEntry.current;
    if (entry !== null && idx !== null) {
      setCells((prev) => {
        const filled = Object.keys(prev).length;
        const base = filled >= TOTAL ? {} : { ...prev };
        base[idx] = entry;
        saveCells(base); // persist to localStorage
        return base;
      });
      pendingEntry.current = null;
    }
    setPhase("idle");
    setLiveEntry(null);
    setTargetRect(null);
  }, []);

  // ── Connect SSE ───────────────────────────────────────────
  useEffect(() => {
    const connect = () => {
      if (esRef.current) esRef.current.close();
      const es = new EventSource(SSE_URL);
      esRef.current = es;
      console.log("🔌 SSE connecting…");

      es.addEventListener("open", () => {
        console.log("✅ SSE connected");
        setConnected(true);
      });

      es.addEventListener("user", (e) => {
        console.log("📩 USER:", e.data);
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.status !== "success") return;
          const entry = parsed.data;

          // Pick target cell (don't fill yet — fill after animation)
          setCells((prev) => {
            const idx = getNextCell(prev);
            targetIdxRef.current = idx;
            pendingEntry.current = entry;
            console.log("🎯 Target cell:", idx);
            return prev; // grid unchanged for now
          });

          // Show modal
          setLiveEntry(entry);
          setPhase("modal");

          // Auto-fly after 6 s
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = setTimeout(() => {
            console.log("⏱ Auto-fly triggered");
            startFly();
          }, 6000);
        } catch (err) {
          console.error("❌ Parse error:", err);
        }
      });

      es.addEventListener("heartbeat", () => {
        console.log("💓 heartbeat");
        setPulse(true);
        setTimeout(() => setPulse(false), 400);
        // Heartbeat → start fly if modal is open
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          console.log("💓 Heartbeat fly");
          startFly();
        }, 800);
      });

      es.addEventListener("error", () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 4000);
      });
    };

    connect();
    return () => {
      esRef.current?.close();
      clearTimeout(idleTimerRef.current);
    };
  }, [getNextCell, startFly]);


 

  return (
    <>
      <style>{tvCss}</style>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          // background: T.surface50,
          background: "black",
          display: "flex",
          flexDirection: "column",
          fontFamily: T.fontBody,
          overflow: "hidden",
        }}
      >
        {/* ══════ HEADER ══════ */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
            background: T.surface0,
            // background: "black",
            borderBottom: `1px solid ${T.surface200}`,
            boxShadow: "0 2px 12px rgba(28,22,17,0.08)",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div></div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0873b8",
              fontFamily: "'Highspeed', sans-serif",
            }}
          >
            Engrave your Vision!
          </div>

          <div style={{ width: 64, height: "auto", marginRight: 30 }}>
            <img
              src={RiseLogo}
              alt="logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </header>

        {/* ══════ GRID ══════ */}
        <div style={{ flex: 1, padding: "12px 16px 16px", overflow: "hidden" }}>
          <div
            className="sp-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              gap: 8,
              width: "100%",
              height: "100%",
            }}
          >
            {Array.from({ length: TOTAL }, (_, i) => (
              <GridCell
                key={i}
                index={i}
                cell={cells[i]}
                // store ref so we can getBoundingClientRect on dismiss
                cellRef={(el) => {
                  if (el) cellRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>

        {/* ══════ FOOTER ══════ */}
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 24px",
            background: T.surface0,
            // background: "black",
            borderTop: `1px solid ${T.surface200}`,
            boxShadow: "0 2px 12px rgba(28,22,17,0.08)",
            flexShrink: 0,
            zIndex: 10,
            gap: 40,
          }}
        >
          <div style={{ width: 74, height: "auto" }}>
            <img
              src={ArianLogo}
              alt="Arian Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div style={{ width: 54, height: "auto" }}>
            <img
              src={SunLogo}
              alt="Rise Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </footer>

        {/* ══════ MODAL — phase: "modal" ══════ */}
        <AnimatePresence>
          {phase === "modal" && liveEntry && (
            <ModalCard key="modal" entry={liveEntry} onDismiss={startFly} />
          )}
        </AnimatePresence>

        {/* ══════ FLYING CARD — phase: "flying" ══════ */}
        <AnimatePresence>
          {phase === "flying" && liveEntry && targetRect && (
            <FlyingCard
              key="flying"
              entry={liveEntry}
              targetRect={targetRect}
              onComplete={onFlyComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  ModalCard — full-size, perfectly centered, slides up
// ─────────────────────────────────────────────────────────────
function ModalCard({ entry, onDismiss }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,15,10,0.55)",
          backdropFilter: "blur(8px)",
          zIndex: 200,
        }}
      />

      {/* Card wrapper — true centering via flex on fixed overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 201,
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 26,
            mass: 0.9,
          }}
          style={{ width: 400, pointerEvents: "auto" }}
        >
          <CardShell entry={entry} />
        </motion.div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  FlyingCard — animates from screen center → target cell rect
// ─────────────────────────────────────────────────────────────
function FlyingCard({ entry, targetRect, onComplete }) {
  // Start position: center of screen (400px wide card centered)
  const startLeft = window.innerWidth / 2 - 200;
  const startTop = window.innerHeight / 2 - 260; // approx card half-height

  return (
    <motion.div
      initial={{
        left: startLeft,
        top: startTop,
        width: 400,
        height: 520,
        opacity: 1,
        borderRadius: 24,
        scale: 1,
      }}
      animate={{
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        opacity: 1,
        borderRadius: 10,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 1,
        duration: 0.65,
      }}
      onAnimationComplete={onComplete}
      style={{
        position: "fixed",
        overflow: "hidden",
        zIndex: 300,
        boxShadow: "0 8px 40px rgba(232,115,26,0.25)",
        transformOrigin: "top left",
      }}
    >
      {/* Same card shell, scales fluidly */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        <MiniCardContent entry={entry} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CardShell — the full-size modal card UI
// ─────────────────────────────────────────────────────────────
function CardShell({ entry }) {
  return (
    <div
      style={{
        background: T.surface0,
        borderRadius: 24,
        overflow: "hidden",
        border: `1px solid ${T.surface200}`,
        boxShadow:
          "0 -4px 50px rgba(28,22,17,0.2), 0 8px 40px rgba(232,115,26,0.18)",
      }}
    >
      {/* New Arrival badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 18,
          paddingBottom: 4,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: T.brand500,
            color: "#fff",
            padding: "5px 16px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: T.fontBody,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            boxShadow: "0 4px 14px rgba(232,115,26,0.4)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
          New Arrival
        </div>
      </div>

      {/* Photo */}
      <div
        style={{
          position: "relative",
          height: 260,
          margin: "10px 14px 0",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <img
          src={imgUrl(entry.Image_Path)}
          alt={entry.Name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "14px 16px",
          }}
        >
          <p
            style={{
              fontFamily: T.fontDisplay,
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {entry.Name}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 18px 18px" }}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: T.brand600,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            margin: "0 0 5px",
            fontFamily: T.fontBody,
          }}
        >
          Comment
        </p>
        <p
          style={{
            fontSize: 13,
            color: T.inkSecondary,
            background: T.surface50,
            padding: "9px 13px",
            borderRadius: 10,
            margin: 0,
            lineHeight: 1.6,
            fontFamily: T.fontBody,
            border: `1px solid ${T.surface200}`,
          }}
        >
          {entry.Comment}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MiniCardContent — shown inside FlyingCard during transition
//  and inside GridCell once landed
// ─────────────────────────────────────────────────────────────
function MiniCardContent({ entry }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.surface0,
      }}
    >
      {/* Photo — top 62% */}
      <div
        style={{ position: "relative", flex: "0 0 62%", overflow: "hidden" }}
      >
        <img
          src={imgUrl(entry.Image_Path)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(14px)",
            transform: "scale(1.15)",
            opacity: 0.5,
          }}
        />
        <img
          src={imgUrl(entry.Image_Path)}
          alt={entry.Name}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: T.brand500,
            zIndex: 3,
          }}
        />
      </div>
      {/* Text — bottom 38% */}
      <div
        style={{
          flex: "1 1 38%",
          padding: "4px 6px 5px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "3px",
          marginTop: "auto",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 10,
            fontWeight: 700,
            color: T.inkPrimary,
            margin: 0,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.Name}
        </p>
        <p
          style={{
            fontFamily: T.fontBody,
            fontSize: 8,
            color: T.inkTertiary,
            margin: 0,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {entry.Comment}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GridCell
// ─────────────────────────────────────────────────────────────
function GridCell({ index, cell, cellRef }) {
  return (
    <motion.div
      ref={cellRef}
      layout
      initial={cell ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        // border: `1px solid ${cell ? T.brand200 : T.surface200}`,
        // background: cell ? T.surface0 : T.surface100,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {cell ? (
        <MiniCardContent entry={cell} />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <img
            src={SunLogo}
            alt=""
            style={{
              width: "auto",
              height: 28,
              objectFit: "contain",
              opacity: 0.25,
            }}
          /> */}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
const tvCss = `
  @font-face {
    font-family: 'Highspeed';
    src: url(${HighspeedFont}) format('opentype');
  }
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; overflow: hidden; }
  .sp-grid > * { min-height: 0; }
  @media (max-width: 768px) {
    .sp-grid {
      grid-template-columns: repeat(5, 1fr) !important;
      grid-template-rows: repeat(8, 1fr) !important;
    }
  }
`;
