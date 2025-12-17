import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId, anweshaIds, minSize, maxSize } = body;

    // 🛑 Basic checks
    if (!eventId || !Array.isArray(anweshaIds)) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    if (anweshaIds.length < minSize || anweshaIds.length > maxSize) {
      return NextResponse.json(
        { message: "Invalid team size" },
        { status: 400 }
      );
    }

    // 🔍 Check existing registrations for this event
    const q = query(
      collection(db, "event_registrations"),
      where("eventId", "==", eventId)
    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const data = docSnap.data();

      // team registration
      if (data.team?.members) {
        for (const id of data.team.members) {
          if (anweshaIds.includes(id)) {
            return NextResponse.json(
              {
                message: `Anwesha ID ${id} is already registered for this event`,
              },
              { status: 400 }
            );
          }
        }
      }

      // solo registration fallback
      if (data.anweshaId && anweshaIds.includes(data.anweshaId)) {
        return NextResponse.json(
          {
            message: `Anwesha ID ${data.anweshaId} already registered`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ All checks passed
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Validate team error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
