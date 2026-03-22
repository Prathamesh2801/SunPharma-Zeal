import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import {
  CheckCircle2,
  ChevronUp,
  MessageSquare,
  CalendarDays,
  Hash,
  Camera,
  Aperture,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateUserImage } from "../api/uploadAPI";

import SunLogo from "../assets/img/SunPharmaLogo.png";
import ArianLogo from "../assets/img/ArianLogo.png";
import RiseLogo from "../assets/img/RiseLogo.png";

// ── Token mirror ─────────────────────────────────────────────
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
  inkDisabled: "#B0A090",
  success: "#2D7D46",
  successSubtle: "#E8F5ED",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  shadowCard: "0 2px 12px rgba(28,22,17,0.08)",
  shadowHover: "0 8px 28px rgba(232,115,26,0.18)",
};

// ── Dummy fetch ──────────────────────────────────────────────
const fetchCards = async () => {
  await new Promise((res) => setTimeout(res, 900));
  return { success: true };
};

const SWIPE_THRESHOLD = -130;

export default function CardSwipe() {
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state?.entry ?? null;

  // ── Dummy data for UI testing ──
  const dummyEntry = {
    fullName: "Mihir Karten",
    comment:
      "This is a test comment to check the UI. Set your goals and achieve them!",
    filePath: "https://media.gettyimages.com/id/1337494696/photo/indian-man-studio-portrait.jpg?s=612x612&w=0&k=20&c=51Vt7ZQ7t4nbADtwVzRdFfp3D0wrQmwdgdKziMG1t04=",
    fileName: "dummy.jpg",
  };

  // Use dummy data if no entry from navigation
  const currentEntry = entry || dummyEntry;

  const [apiLoading, setApiLoading] = useState(true);
  const [swiped, setSwiped] = useState(false);

  const y = useMotionValue(0);
  const controls = useAnimation();

  const cardOpacity = useTransform(y, [0, SWIPE_THRESHOLD], [1, 0.25]);
  const cardScale = useTransform(y, [0, SWIPE_THRESHOLD], [1, 0.88]);
  const hintOpacity = useTransform(y, [0, -40], [1, 0]);
  const confirmScale = useTransform(y, [0, SWIPE_THRESHOLD], [0.6, 1.1]);
  const confirmOpacity = useTransform(
    y,
    [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
    [0, 0.4, 1]
  );

  useEffect(() => {
    fetchCards()
      .then((res) => {
        if (res.success) console.log("Ready!", { icon: "🗂️" });
      })
      .catch(() => toast.error("Failed to load."))
      .finally(() => setApiLoading(false));
  }, []);

  const onSwipeSuccess = async () => {
    try {
      setApiLoading(true);

      const filename = currentEntry?.fileName;
      console.log("File Name  : ", filename);
      if (!filename) {
        toast.error("Missing image filename");
        return;
      }

      const res = await updateUserImage("uploads/" + filename);

      toast.success(res.message || "Updated successfully");

      setSwiped(true);
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setApiLoading(false);
    }
  };

  const handleDragEnd = async (_, info) => {
    if (info.offset.y < SWIPE_THRESHOLD || info.velocity.y < -400) {
      await controls.start({
        y: -window.innerHeight,
        opacity: 0,
        scale: 0.88,
        transition: { duration: 0.38, ease: "easeIn" },
      });
      await onSwipeSuccess();
      setSwiped(true);
      toast.success("Confirmed!", { icon: "✅" });
    } else {
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  };

  const triggerSwipe = async () => {
    await controls.start({
      y: -window.innerHeight,
      opacity: 0,
      scale: 0.88,
      transition: { duration: 0.42, ease: "easeIn" },
    });
    await onSwipeSuccess();
    setSwiped(true);
    toast.success("Confirmed!", { icon: "✅" });
  };

  // ── No entry guard ─────────────────────────────────────────
  if (!entry) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.surface50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 320,
            width: "100%",
            background: T.surface0,
            borderRadius: 16,
            border: `1px solid ${T.surface200}`,
            padding: 24,
            textAlign: "center",
            boxShadow: T.shadowCard,
          }}
        >
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: 14,
              color: T.inkTertiary,
              marginBottom: 16,
            }}
          >
            No submission data found.
          </p>
          <button onClick={() => navigate("/")} style={primaryBtnStyle}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{cardCss}</style>
      <div
        style={{
          minHeight: "95vh",
          background: T.surface50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top right logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            height: 50,
            zIndex: 15,
          }}
        >
          <img
            src={RiseLogo}
            alt="Rise Logo"
            style={{
              height: "100%",
              objectFit: "contain",
            }}
          />
        </motion.div>

        {/* Bottom center logos */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            position: "absolute",
            bottom: 20,
            // left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            zIndex: 15,
          }}
        >
          <img
            src={SunLogo}
            alt="Sun Pharma Logo"
            style={{
              height: 45,
              objectFit: "contain",
            }}
          />
          <img
            src={ArianLogo}
            alt="Arian Logo"
            style={{
              height: 45,
              objectFit: "contain",
            }}
          />
        </motion.div>
        {/* ── Loading overlay ── */}
        <AnimatePresence>
          {apiLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(251,248,245,0.85)",
                backdropFilter: "blur(4px)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `4px solid ${T.surface200}`,
                  borderTopColor: T.brand500,
                }}
              />
              <p
                style={{
                  fontFamily: T.fontBody,
                  fontSize: 13,
                  color: T.inkTertiary,
                }}
              >
                Loading…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirmed state ── */}
        <AnimatePresence>
          {swiped && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                textAlign: "center",
                zIndex: 10,
                width: "100%",
                maxWidth: 360,
                padding: "0 24px",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: T.successSubtle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={40} style={{ color: T.success }} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: T.inkPrimary,
                    margin: 0,
                  }}
                >
                  All Done!
                </h2>
                <p
                  style={{
                    fontFamily: T.fontBody,
                    fontSize: 14,
                    color: T.inkTertiary,
                    marginTop: 6,
                  }}
                >
                  Submission confirmed for{" "}
                  <strong>{currentEntry.fullName}</strong>.
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                style={{
                  ...primaryBtnStyle,
                  display: "inline-flex",
                  gap: 8,
                  width: "auto",
                  padding: "12px 28px",
                }}
              >
                <Camera size={15} /> New Capture
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Swipe hint ── */}
        {!swiped && !apiLoading && (
          <motion.div
            style={{
              position: "absolute",
              top: 28,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              zIndex: 10,
              opacity: hintOpacity,
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronUp size={22} style={{ color: T.brand500 }} />
            </motion.div>
            <span
              style={{
                fontSize: 11,
                fontFamily: T.fontBody,
                color: T.inkTertiary,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Swipe up to confirm
            </span>
          </motion.div>
        )}

        {/* ── Confirm bubble (appears on drag) ── */}
        {!swiped && (
          <motion.div
            style={{
              position: "absolute",
              top: 72,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 6,
              zIndex: 10,
              pointerEvents: "none",
              scale: confirmScale,
              opacity: confirmOpacity,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: T.successSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={24} style={{ color: T.success }} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: T.fontBody,
                fontWeight: 600,
                color: T.success,
              }}
            >
              Release to confirm
            </span>
          </motion.div>
        )}

        {/* ── THE CARD ── */}
        {!swiped && !apiLoading && (
          <motion.div
            drag="y"
            dragConstraints={{ top: SWIPE_THRESHOLD * 2.5, bottom: 20 }}
            dragElastic={{ top: 0.28, bottom: 0.05 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{
              y,
              opacity: cardOpacity,
              scale: cardScale,
              position: "relative",
              zIndex: 20,
              width: "100%",
              maxWidth: 420,
              padding: "0 16px",
              cursor: "grab",
              userSelect: "none",
              marginTop: "auto",
              marginBottom: "auto",
            }}
            whileTap={{ cursor: "grabbing" }}
          >
            {/* Card */}
            <div
              style={{
                background: T.surface200,
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: T.shadowHover,
                border: `1px solid ${T.surface200}`,
              }}
            >
              {/* ── Photo ── */}
              <div
                style={{
                  position: "relative",
                  height: 260,
                  overflow: "hidden",
                }}
              >
                <img
                  src={currentEntry.filePath}
                  alt={currentEntry.fullName}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
                {/* Gradient */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
                  }}
                />

                {/* Name overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 18px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {currentEntry.fullName}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                    }}
                  ></div>
                </div>

                {/* Brand badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,

                    borderRadius: 999,
                    padding: "10px 10px",
                  }}
                >
                  {/* <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={logo}
                      alt="logo"
                      style={{
                        width: "auto",
                        height: 48,
                        objectFit: "contain",
                        opacity: 0.5,
                      }}
                    />
                  </div> */}
                </div>
              </div>

              {/* ── Card body ── */}
              <div
                style={{
                  padding: "18px 18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Comment block */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    <MessageSquare size={13} style={{ color: T.brand500 }} />
                    <span
                      style={{
                        fontFamily: T.fontBody,
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.brand600,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                      }}
                    >
                      Set You Goal
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: T.fontBody,
                      fontSize: 13,
                      color: T.inkSecondary,
                      lineHeight: 1.65,
                      background: T.surface50,
                      border: `1px solid ${T.surface200}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      margin: 0,
                    }}
                  >
                    {currentEntry.comment}
                  </p>
                </div>

                {/* Confirm button */}
                <button
                  onClick={triggerSwipe}
                  className="sp-confirm-btn"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "13px 0",
                    borderRadius: 12,
                    border: `2px dashed ${T.brand300}`,
                    background: "transparent",
                    color: T.brand600,
                    fontFamily: T.fontBody,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <ChevronUp size={16} />
                  Confirm &amp; Submit
                </button>
              </div>
            </div>

            {/* Depth shadow */}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: 24,
                right: 24,
                height: 24,
                borderRadius: 24,
                zIndex: -1,
                background: T.surface200,
                filter: "blur(10px)",
                opacity: 0.55,
              }}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}

const primaryBtnStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 20px",
  background: "#E8731A",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 18px rgba(232,115,26,0.35)",
};

const cardCss = `
  .sp-confirm-btn:hover  { background: #FFF5EB !important; }
  .sp-confirm-btn:active { transform: scale(0.98); }
`;
