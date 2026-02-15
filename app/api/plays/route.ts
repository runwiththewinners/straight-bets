import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID, PREMIUM_TIERS } from "@/lib/constants";
import type { Play } from "@/lib/types";

// In-memory store (replace with a database in production)
let plays: Play[] = [];

async function checkIsAdmin(request: NextRequest): Promise<{
  isAdmin: boolean;
  userId: string | null;
}> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return { isAdmin: false, userId: null };

    const access = await whopsdk.users.checkAccess(COMPANY_ID, {
      id: userId,
    });
    return { isAdmin: access.access_level === "admin", userId };
  } catch {
    return { isAdmin: false, userId: null };
  }
}

async function checkPremiumAccess(
  request: NextRequest
): Promise<{ userId: string; hasPremiumAccess: boolean } | null> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return null;

    let hasPremiumAccess = false;
    for (const productId of PREMIUM_TIERS) {
      try {
        const access =
          await whopsdk.access.checkIfUserHasAccessToAccessPass({
            accessPassId: productId,
            userId,
          });
        if (access.hasAccess) {
          hasPremiumAccess = true;
          break;
        }
      } catch {}
    }

    return { userId, hasPremiumAccess };
  } catch {
    return null;
  }
}

// GET /api/plays
export async function GET(request: NextRequest) {
  const user = await checkPremiumAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isAdmin } = await checkIsAdmin(request);

  if (user.hasPremiumAccess || isAdmin) {
    return NextResponse.json({ plays, isAdmin });
  } else {
    const redactedPlays = plays
      .filter((p) => p.result === "pending")
      .map((p) => ({
        id: p.id,
        sport: p.sport,
        postedAt: p.postedAt,
        result: p.result,
        team: "🔒 Locked",
        betType: p.betType,
        odds: "🔒",
        matchup: "🔒 Upgrade to view",
        time: p.time,
        units: 0,
        createdAt: p.createdAt,
      }));
    return NextResponse.json({ plays: redactedPlays, isAdmin: false });
  }
}

// POST /api/plays (admin only)
export async function POST(request: NextRequest) {
  const { isAdmin, userId } = await checkIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const newPlay: Play = {
    id: `play_${Date.now()}`,
    team: body.team,
    betType: body.betType,
    odds: body.odds,
    matchup: body.matchup,
    time: body.time,
    sport: body.sport,
    result: "pending",
    postedAt:
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      }) + " ET",
    units: body.units || 1,
    createdAt: Date.now(),
  };

  plays.unshift(newPlay);
  return NextResponse.json({ play: newPlay, success: true });
}

// PATCH /api/plays (admin only)
export async function PATCH(request: NextRequest) {
  const { isAdmin } = await checkIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { id, result } = body;

  const playIndex = plays.findIndex((p) => p.id === id);
  if (playIndex === -1) {
    return NextResponse.json({ error: "Play not found" }, { status: 404 });
  }

  plays[playIndex].result = result;
  return NextResponse.json({ play: plays[playIndex], success: true });
}
