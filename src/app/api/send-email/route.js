import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { subject, message, type, eventId } = await req.json();

    // 1. Fetch Email List based on selection
    let emails = [];
    const usersRef = collection(db, "users");

    if (type === 'all') {
      // Fetch ALL users
      const snapshot = await getDocs(usersRef);
      emails = snapshot.docs.map(doc => doc.data().email).filter(email => email);
    } else if (type === 'event' && eventId) {
      // Fetch users where 'events' array contains this eventId
      // Note: This assumes you store event IDs in the user's 'events' array
      const q = query(usersRef, where("events", "array-contains", eventId));
      const snapshot = await getDocs(q);
      emails = snapshot.docs.map(doc => doc.data().email).filter(email => email);
    }

    if (emails.length === 0) {
      return NextResponse.json({ success: false, message: "No users found for this selection." });
    }

    // 2. Configure Transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send Emails (Using BCC for privacy)
    // For huge lists (500+), you'd want a dedicated service like SendGrid, but this works for small batches.
    const mailOptions = {
      from: `"Anwesha Admin" <${process.env.EMAIL_USER}>`,
      bcc: emails, // BCC hides recipients from each other
      subject: subject,
      text: message, // Plain text version
      html: `<div style="font-family: sans-serif;">
              <h2>${subject}</h2>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p style="font-size: 12px; color: gray;">Sent from Anwesha Admin Panel</p>
             </div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, count: emails.length });

  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}