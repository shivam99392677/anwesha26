import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../../../../lib/firebaseConfig";

export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, items, orderId, paymentId } = body;

    for (const item of items) {
      // Multicity Events
      if (item.type === "event" && item.eventCategory === "multicity") {
        const ref = doc(db, "multicity", item.city, "registrations", orderId);

        await setDoc(ref, {
          uid,
          eventId: item.id,
          eventName: item.name,
          city: item.city,
          date: item.date,
          eventCategory: item.eventCategory,
          createdAt: serverTimestamp(),
          orderId: orderId,
          paymentId: paymentId,
        });
      }

      // Normal Events
      else if (item.type === "event") {
        const cleaned = item.id.replace(/\s+/g, "_");

        const ref = doc(
          db,
          "event_registrations",
          item.eventCategory,
          cleaned,
          orderId
        );

        await setDoc(ref, {
          uid, // captain UID
          eventId: item.id,
          eventName: item.name,
          eventCategory: item.eventCategory,

          //  TEAM DATA (only if exists)
          team: item.team
            ? {
                name: item.team.name,
                members: item.team.members, // array of Anwesha IDs
                captainUid: uid,
              }
            : null,

          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        });
      }

      // Store Items
      else if (item.type === "store") {
        const ref = doc(db, "store_orders", item.id, "orders", orderId);

        await setDoc(ref, {
          uid,
          productId: item.id,
          orderId: orderId,
          paymentId: paymentId,
          productName: item.name,
          createdAt: serverTimestamp(),
        });
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false });
  }
}
