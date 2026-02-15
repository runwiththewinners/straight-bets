import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID } from "@/lib/constants";

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return false;

    const access = await whopsdk.users.checkAccess(COMPANY_ID, {
      id: userId,
    });
    return access.access_level === "admin";
  } catch {
    return false;
  }
}

// POST /api/notify — send push notification to all users
export async function POST(request: NextRequest) {
  const isAdmin = await checkIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { team, odds, sport, experienceId, companyId } = body;

  try {
    const notificationParams: Record<string, any> = {
      title: `🔥 New Straight Bet — ${sport}`,
      subtitle: "FlareGotLocks just dropped a play",
      content: `${team} (${odds}) — Check it now!`,
    };

    if (experienceId) {
      notificationParams.experience_id = experienceId;
    } else if (companyId) {
      notificationParams.company_id = companyId;
    }

    const result = await whopsdk.notifications.create(notificationParams);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification", details: error?.message },
      { status: 500 }
    );
  }
}
