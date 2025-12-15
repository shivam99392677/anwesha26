import SHA256 from "crypto-js/sha256";

// ⚠️ Keep this secret key safe and do NOT expose it in frontend ideally
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY_QR_HASHING;

// Generate secure QR payload
export const generateQrPayload = (user) => {
  if (!user || !user.anweshaId) return "";

  // Combine all user info you want to secure
  const userDataString = [
    user.anweshaId,
    user.firstName,
    user.lastName,
    user.email,
    user.contact || "",
    user.college || "",
    user.dob || "",
    user.gender || ""
  ].join("|");

  // Add secret key to hash
  const hash = SHA256(userDataString + SECRET_KEY).toString();

  // Encode user data (base64) to avoid exposing plain text
  const base64Data = btoa(userDataString);

  // Final QR payload: base64 data + hash
  return `${base64Data}|${hash}`;
};

// Verify QR payload
export const  decodeQrPayload = (qrString) => {
  if (!qrString) return false;

  const parts = qrString.split("|");
  if (parts.length !== 2) return false;

  const [base64Data, receivedHash] = parts;
  const originalData = atob(base64Data); // decode base64

  const recalculatedHash = SHA256(originalData + SECRET_KEY).toString();

  if (receivedHash === recalculatedHash) {
    const [anweshaId, firstName, lastName, email, contact, college, dob, gender] = originalData.split("|");
    return { anweshaId, firstName, lastName, email, contact, college, dob, gender };
  }
  return false;
};
