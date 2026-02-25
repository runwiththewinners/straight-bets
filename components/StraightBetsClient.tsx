"use client";

import { useState, useEffect, useCallback } from "react";
import type { Play, BetResult, UserAccess, Sport, BetType } from "@/lib/types";

const SPORTS_ICONS: Record<string, string> = {
  NBA: "🏀",
  NFL: "🏈",
  NCAAB: "🏀",
  NCAAF: "🏈",
  MLB: "⚾",
  NHL: "🏒",
  Soccer: "⚽",
  UFC: "🥊",
  Tennis: "🎾",
};

const BET_TYPES: BetType[] = [
  "SPREAD",
  "MONEYLINE",
  "OVER/UNDER",
  "ALTERNATE SPREAD",
  "PLAYER PROP",
  "FIRST HALF SPREAD",
  "FIRST HALF ML",
  "GAME TOTAL",
];

const SPORTS: Sport[] = [
  "NCAAB",
  "NBA",
  "NFL",
  "NCAAF",
  "NHL",
  "MLB",
  "Soccer",
  "UFC",
  "Tennis",
];

const RESULT_STYLES: Record<
  BetResult,
  { bg: string; border: string; text: string; label: string; glow: string }
> = {
  win: {
    bg: "rgba(34, 197, 94, 0.08)",
    border: "rgba(34, 197, 94, 0.5)",
    text: "#22c55e",
    label: "WIN",
    glow: "0 0 20px rgba(34, 197, 94, 0.15)",
  },
  loss: {
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.5)",
    text: "#ef4444",
    label: "LOSS",
    glow: "0 0 20px rgba(239, 68, 68, 0.15)",
  },
  push: {
    bg: "rgba(234, 179, 8, 0.08)",
    border: "rgba(234, 179, 8, 0.5)",
    text: "#eab308",
    label: "PUSH",
    glow: "0 0 20px rgba(234, 179, 8, 0.15)",
  },
  pending: {
    bg: "rgba(212, 168, 67, 0.03)",
    border: "rgba(212, 168, 67, 0.2)",
    text: "#9ca3af",
    label: "PENDING",
    glow: "0 0 20px rgba(212, 168, 67, 0.08)",
  },
};

// ─── Play Card ───────────────────────────────────────────────────
function PlayCard({
  play,
  onUpdateResult,
  onDelete,
  isAdmin,
}: {
  play: Play;
  onUpdateResult: (id: string, result: BetResult) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const result = RESULT_STYLES[play.result] || RESULT_STYLES.pending;
  const isPending = play.result === "pending";

  return (
    <div
      style={{
        background: "#111111",
        border: `1px solid ${result.border}`,
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.5s ease forwards",
        boxShadow: result.glow,
      }}
    >
      {/* Green accent bar */}
      <div
        style={{
          height: 3,
          background: isPending
            ? "linear-gradient(90deg, transparent, #d4a843, transparent)"
            : `linear-gradient(90deg, transparent, ${result.text}, transparent)`,
        }}
      />

      <div style={{ padding: "20px 24px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>
              {SPORTS_ICONS[play.sport] || "🎯"}
            </span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                STRAIGHT BET
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.postedAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: isPending ? "#d4a843" : result.text,
                background: isPending
                  ? "rgba(212, 168, 67, 0.1)"
                  : result.bg,
                border: `1px solid ${isPending ? "rgba(212, 168, 67, 0.3)" : result.border}`,
                borderRadius: 6,
                padding: "3px 10px",
                letterSpacing: 2,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {result.label}
            </span>
          </div>
        </div>

        {/* Inner card with pick details */}
        <div
          style={{
            background: "rgba(212, 168, 67, 0.03)",
            border: "1px solid rgba(212, 168, 67, 0.1)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#f5f5f5",
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {play.team}
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#6b7280",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {play.sport}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.matchup}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#d4a843",
              fontFamily: "'Courier Prime', monospace",
              marginTop: 6,
            }}
          >
            {play.betType} {play.odds}
          </div>
        </div>

        {/* Bet Slip Image */}
        {play.slipImage && (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(212, 168, 67, 0.1)",
              background: "rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontFamily: "'Courier Prime', monospace",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#d4a843",
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(8px)",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid rgba(212, 168, 67, 0.2)",
              }}
            >
              📋 VIEW SLIP
            </span>
            <img
              src={play.slipImage}
              alt="Bet slip"
              style={{
                width: "100%",
                display: "block",
                maxHeight: 220,
                objectFit: "contain",
                background: "#0a0a0a",
              }}
            />
          </div>
        )}

        {/* Game time footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.matchup}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.time}
          </span>
        </div>

        {/* Admin result buttons — styled like parlay WIN/LOSS/PUSH */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["win", "loss", "push"] as BetResult[]).map((r) => {
              const s = RESULT_STYLES[r];
              const isActive = play.result === r;
              return (
                <button
                  key={r}
                  onClick={() => onUpdateResult(play.id, r === play.result ? "pending" : r)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: isActive
                      ? `2px solid ${s.text}`
                      : `1px solid ${s.border}`,
                    background: isActive
                      ? s.bg
                      : "rgba(255,255,255,0.02)",
                    color: isActive ? s.text : `${s.text}88`,
                    fontSize: 13,
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {r.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Admin delete button */}
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => onDelete(play.id)}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.15)",
                background: "rgba(239,68,68,0.04)",
                color: "#ef444488",
                fontSize: 11,
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🗑 DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Paywall Card ────────────────────────────────────────────────
function PaywallCard({ play }: { play: Play }) {
  const handleUpgrade = () => {
    window.parent.postMessage(
      { type: "whop:navigate", productId: "prod_o1jjamUG8rP8W" },
      "*"
    );
  };

  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(212, 168, 67, 0.15)",
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, transparent, #d4a843, transparent)",
        }}
      />
      <div style={{ padding: "20px 24px" }}>
        {/* Visible header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>
              {SPORTS_ICONS[play.sport] || "🎯"}
            </span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  letterSpacing: 2,
                  fontWeight: 700,
                }}
              >
                STRAIGHT BET
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.postedAt}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Courier Prime', monospace",
              color: "#ef4444",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 6,
              padding: "3px 10px",
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            🔒 LOCKED
          </span>
        </div>

        {/* Blurred pick */}
        <div
          style={{
            background: "rgba(212, 168, 67, 0.03)",
            border: "1px solid rgba(212, 168, 67, 0.08)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              filter: "blur(12px)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#f5f5f5",
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              TEAM NAME +350
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#d4a843",
                fontFamily: "'Courier Prime', monospace",
                marginTop: 6,
              }}
            >
              MONEYLINE +350
            </div>
          </div>
        </div>

        {/* Blurred matchup */}
        <div
          style={{
            filter: "blur(8px)",
            userSelect: "none",
            pointerEvents: "none",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            Team A @ Team B
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            0:00PM ET
          </span>
        </div>

        {/* Upgrade CTA */}
        <div
          style={{
            marginTop: 18,
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(212, 168, 67, 0.04)",
            border: "1px solid rgba(212, 168, 67, 0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              color: "#d4a843",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            🔒 UPGRADE TO UNLOCK
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Premium & High Roller members get all straight bet picks
          </div>
          <button
            onClick={handleUpgrade}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              border: "1px solid rgba(212, 168, 67, 0.4)",
              background: "rgba(212, 168, 67, 0.1)",
              color: "#d4a843",
              fontSize: 12,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            UPGRADE NOW
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────
function AdminPanel({
  onPost,
  onClose,
}: {
  onPost: (play: any) => void;
  onClose: () => void;
}) {
  const [team, setTeam] = useState("");
  const [betType, setBetType] = useState<BetType>("SPREAD");
  const [odds, setOdds] = useState("");
  const [matchup, setMatchup] = useState("");
  const [time, setTime] = useState("");
  const [sport, setSport] = useState<Sport>("NCAAB");
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");

  const handlePost = () => {
    if (!team || !odds || !matchup || !time) return;
    onPost({
      team,
      betType,
      odds: odds.startsWith("+") || odds.startsWith("-") ? odds : `-${odds}`,
      matchup,
      time,
      sport,
      slipImage: scanPreview || undefined,
    });
    setTeam("");
    setOdds("");
    setMatchup("");
    setTime("");
    setScanPreview(null);
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError("");
    setScanning(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setScanPreview(base64Full);
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64Data, mediaType }),
        });

        const data = await response.json();
        if (!data.success || !data.result) {
          throw new Error(data.error || "Scan failed");
        }
        const parsed = data.result;

        if (parsed.team) setTeam(parsed.team);
        if (parsed.betType) setBetType(parsed.betType);
        if (parsed.odds) setOdds(parsed.odds);
        if (parsed.matchup) setMatchup(parsed.matchup);
        if (parsed.time) setTime(parsed.time);
        if (parsed.sport) setSport(parsed.sport);
      } catch (err) {
        console.error("Scan error:", err);
        setScanError(
          "Couldn't read that slip. Try a clearer screenshot or fill in manually."
        );
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(212, 168, 67, 0.15)",
    background: "rgba(212, 168, 67, 0.03)",
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: "'Courier Prime', monospace",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: "'Courier Prime', monospace",
    color: "#d4a843",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
    fontWeight: 700,
  };

  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(212, 168, 67, 0.2)",
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.4s ease forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, transparent, #d4a843, transparent)",
        }}
      />
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 700,
              color: "#d4a843",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            🎯 NEW STRAIGHT BET
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#6b7280",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Bet Slip Upload */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: scanPreview ? "12px" : "28px 20px",
              borderRadius: 12,
              border: scanning
                ? "2px solid rgba(212, 168, 67, 0.4)"
                : "2px dashed rgba(212, 168, 67, 0.15)",
              background: scanning
                ? "rgba(212, 168, 67, 0.06)"
                : "rgba(212, 168, 67, 0.02)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              overflow: "hidden",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleSlipUpload}
              style={{ display: "none" }}
            />
            {scanning ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "'Courier Prime', monospace",
                    color: "#d4a843",
                    letterSpacing: 2,
                    fontWeight: 700,
                  }}
                >
                  SCANNING BET SLIP...
                </div>
              </div>
            ) : scanPreview ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                }}
              >
                <img
                  src={scanPreview}
                  alt="Bet slip"
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid rgba(212, 168, 67, 0.2)",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "'Courier Prime', monospace",
                      color: "#22c55e",
                      letterSpacing: 2,
                      fontWeight: 700,
                    }}
                  >
                    ✓ SLIP SCANNED
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Review below · tap to re-upload
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "'Courier Prime', monospace",
                    color: "#d4a843",
                    letterSpacing: 2,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  UPLOAD BET SLIP
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  DraftKings, FanDuel, etc. — AI auto-fills
                </div>
              </>
            )}
          </label>
          {scanError && (
            <div
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 12,
              }}
            >
              {scanError}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: "rgba(212, 168, 67, 0.1)" }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Courier Prime', monospace",
              color: "#4b5563",
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            OR MANUAL
          </span>
          <div
            style={{ flex: 1, height: 1, background: "rgba(212, 168, 67, 0.1)" }}
          />
        </div>

        {/* Form fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Pick / Team</label>
            <input
              style={inputStyle}
              placeholder="e.g. Duke -9.5"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Odds</label>
            <input
              style={inputStyle}
              placeholder="e.g. +350"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Matchup</label>
            <input
              style={inputStyle}
              placeholder="e.g. Clemson @ Duke"
              value={matchup}
              onChange={(e) => setMatchup(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Game Time</label>
            <input
              style={inputStyle}
              placeholder="e.g. 8:00PM ET"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Sport</label>
            <select
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
              value={sport}
              onChange={(e) => setSport(e.target.value as Sport)}
            >
              {SPORTS.map((s) => (
                <option key={s} value={s} style={{ background: "#111111" }}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Bet Type</label>
            <select
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
              value={betType}
              onChange={(e) => setBetType(e.target.value as BetType)}
            >
              {BET_TYPES.map((b) => (
                <option key={b} value={b} style={{ background: "#111111" }}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePost}
          disabled={!team || !odds || !matchup || !time}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: !team || !odds || !matchup || !time
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(212, 168, 67, 0.4)",
            background: !team || !odds || !matchup || !time
              ? "rgba(255,255,255,0.03)"
              : "rgba(212, 168, 67, 0.12)",
            color: !team || !odds || !matchup || !time ? "#4b5563" : "#d4a843",
            fontSize: 14,
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            cursor: !team || !odds || !matchup || !time ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
        >
          DROP PLAY 🎯
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function StraightBetsClient({
  userAccess,
}: {
  userAccess: UserAccess;
}) {
  const [plays, setPlays] = useState<Play[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showGraded, setShowGraded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);

  const { hasPremiumAccess, isAdmin } = userAccess;

  const fetchPlays = useCallback(async () => {
    try {
      const res = await fetch("/api/plays");
      if (res.ok) {
        const data = await res.json();
        setPlays(data.plays);
      }
    } catch (err) {
      console.error("Error fetching plays:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
    const interval = setInterval(fetchPlays, 30000);
    return () => clearInterval(interval);
  }, [fetchPlays]);

  const handlePost = async (playData: any) => {
    try {
      const res = await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playData),
      });

      if (res.ok) {
        const data = await res.json();
        setPlays((prev) => [data.play, ...prev]);
        setShowAdmin(false);

        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team: playData.team,
              odds: playData.odds,
              sport: playData.sport,
            }),
          });
        } catch (err) {
          console.error("Notification error:", err);
        }

        setNotification(data.play);
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err) {
      console.error("Error posting play:", err);
    }
  };

  const handleUpdateResult = async (id: string, result: BetResult) => {
    try {
      const res = await fetch("/api/plays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, result }),
      });

      if (res.ok) {
        setPlays((prev) =>
          prev.map((p) => (p.id === id ? { ...p, result } : p))
        );
      }
    } catch (err) {
      console.error("Error updating result:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/plays", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPlays((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting play:", err);
    }
  };

  const pendingPlays = plays.filter((p) => p.result === "pending");
  const gradedPlays = plays.filter((p) => p.result !== "pending");

  const record = {
    wins: plays.filter((p) => p.result === "win").length,
    losses: plays.filter((p) => p.result === "loss").length,
    pushes: plays.filter((p) => p.result === "push").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "'Courier Prime', monospace",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 168, 67, 0.08); }
          50% { box-shadow: 0 0 40px rgba(212, 168, 67, 0.15); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212, 168, 67, 0.2); border-radius: 3px; }
        select option { background: #111111 !important; color: #f5f5f5; }
      `}</style>

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            animation: "slideDown 0.4s ease forwards",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: "12px auto",
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(13,17,23,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(212, 168, 67, 0.3)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212, 168, 67, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(212, 168, 67, 0.12)",
                border: "1px solid rgba(212, 168, 67, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  letterSpacing: 2,
                  marginBottom: 2,
                  fontWeight: 700,
                }}
              >
                STRAIGHT BET
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  color: "#f5f5f5",
                }}
              >
                {hasPremiumAccess || isAdmin
                  ? `${notification.team} (${notification.odds})`
                  : "New straight bet dropped! Upgrade to view"}
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 67, 0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
            animation: "fadeSlideIn 0.5s ease forwards",
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontFamily: "'Courier Prime', monospace",
              color: "#d4a843",
              letterSpacing: 4,
              textTransform: "uppercase",
              border: "1px solid rgba(212, 168, 67, 0.3)",
              borderRadius: 100,
              padding: "6px 20px",
              marginBottom: 20,
              background: "rgba(212, 168, 67, 0.06)",
              fontWeight: 700,
            }}
          >
            🎯 Live Feed
          </div>

          <h1
            style={{
              fontSize: 48,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#f5f5f5" }}>Straight</span>
            <br />
            <span
              style={{
                color: "#d4a843",
              }}
            >
              Bets
            </span>
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              maxWidth: 380,
              margin: "12px auto 0",
              lineHeight: 1.6,
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            Every straight bet play, posted live.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Live" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border:
                  filter === f.key
                    ? "1px solid rgba(212, 168, 67, 0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  filter === f.key
                    ? "rgba(212, 168, 67, 0.1)"
                    : "rgba(255,255,255,0.02)",
                color: filter === f.key ? "#d4a843" : "#6b7280",
                fontSize: 12,
                fontFamily: "'Courier Prime', monospace",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Admin record */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "WON",
                value: record.wins,
                color: "#22c55e",
                bg: "rgba(34, 197, 94, 0.06)",
                border: "rgba(34, 197, 94, 0.25)",
              },
              {
                label: "LOST",
                value: record.losses,
                color: "#ef4444",
                bg: "rgba(239, 68, 68, 0.06)",
                border: "rgba(239, 68, 68, 0.25)",
              },
              {
                label: "PUSH",
                value: record.pushes,
                color: "#eab308",
                bg: "rgba(234, 179, 8, 0.06)",
                border: "rgba(234, 179, 8, 0.25)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "14px 12px",
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: "'Oswald', sans-serif",
                    color: stat.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'Courier Prime', monospace",
                    color: stat.color,
                    letterSpacing: 2,
                    opacity: 0.7,
                    fontWeight: 700,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            {showAdmin ? (
              <AdminPanel onPost={handlePost} onClose={() => setShowAdmin(false)} />
            ) : (
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "1px solid rgba(212, 168, 67, 0.2)",
                  background: "rgba(212, 168, 67, 0.06)",
                  color: "#d4a843",
                  fontSize: 12,
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                ⚙ ADMIN — POST NEW PLAY
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
              fontSize: 13,
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            Loading plays...
          </div>
        ) : (
          <>
            {/* Plays feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {pendingPlays.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#4b5563",
                    fontSize: 13,
                    fontFamily: "'Courier Prime', monospace",
                  }}
                >
                  No plays yet. Check back soon.
                </div>
              ) : hasPremiumAccess || isAdmin ? (
                pendingPlays.map((play) => (
                  <PlayCard
                    key={play.id}
                    play={play}
                    onUpdateResult={handleUpdateResult}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                pendingPlays.map((play) => (
                  <PaywallCard key={play.id} play={play} />
                ))
              )}
            </div>

            {/* Graded plays */}
            {isAdmin && gradedPlays.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <button
                  onClick={() => setShowGraded(!showGraded)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#6b7280",
                    fontSize: 12,
                    fontFamily: "'Courier Prime', monospace",
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>📋 GRADED ({gradedPlays.length})</span>
                  <span
                    style={{
                      transform: showGraded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      fontSize: 10,
                    }}
                  >
                    ▼
                  </span>
                </button>

                {showGraded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      marginTop: 16,
                    }}
                  >
                    {gradedPlays.map((play) => (
                      <PlayCard
                        key={play.id}
                        play={play}
                        onUpdateResult={handleUpdateResult}
                        onDelete={handleDelete}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#1f2937",
              fontFamily: "'Courier Prime', monospace",
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            RWTW
          </div>
        </div>
      </div>
    </div>
  );
}
