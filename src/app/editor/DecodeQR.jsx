"use client";
import React, { useState, useEffect, useRef } from "react";
import { decodeQrPayload } from "../../services/qr";
import QRCode from "react-qr-code";
import { Html5Qrcode } from "html5-qrcode";
import { db } from "../../lib/firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function VerifyQr() {
  const [activeTab, setActiveTab] = useState("scan"); // "scan" or "search"
  const [searchType, setSearchType] = useState("anweshaId"); // "anweshaId" or "email"

  // QR State
  const [qrInput, setQrInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  // Search State
  const [searchId, setSearchId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchName, setSearchName] = useState("");

  // Result State
  const [decodedData, setDecodedData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Movement Tracking State
  const [movementStatus, setMovementStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Start QR scanner
  const startScanner = () => {
    setDecodedData(null);
    setError("");
    setScannerActive(true);

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          html5QrCode.stop();
          setScannerActive(false);
          handleDecoded(decodedText);
        },
        (errorMessage) => {
          // console.log("QR scan error:", errorMessage);
        }
      )
      .catch((err) => {
        setError("Unable to start QR scanner: " + err);
        setScannerActive(false);
      });

    scannerRef.current = html5QrCode;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => { });
      setScannerActive(false);
    }
  };

  const handleDecoded = (decodedText) => {
    setQrInput(decodedText);
    const result = decodeQrPayload(decodedText);
    if (result) {
      setDecodedData(result);
      setError("");
      toast.success("QR Verified Successfully!");
    } else {
      setDecodedData(null);
      setError("Invalid or tampered QR payload!");
      toast.error("Invalid QR Code");
    }
  };

  const handleVerifyQrManual = () => {
    setError("");
    setDecodedData(null);
    handleDecoded(qrInput);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setDecodedData(null);
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      let q;

      if (searchType === "anweshaId") {
        if (!searchId) throw new Error("Please enter Anwesha ID");
        q = query(usersRef, where("anweshaId", "==", searchId.trim()));
      } else {
        if (!searchEmail) throw new Error("Please enter Email");
        q = query(usersRef, where("email", "==", searchEmail.trim()));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with these details.");
        toast.error("User not found");
      } else {
        // Helper to safely extract string from potential objects
        const safeString = (val) => {
          if (!val) return "";
          if (typeof val === "string") return val;
          if (typeof val === "object") {
            return val.name || val.fullName || val.phone || val.phoneNumber || val.value || JSON.stringify(val);
          }
          return String(val);
        };

        const userDoc = querySnapshot.docs[0].data();
        // Format data to match QR structure for consistent display
        const userData = {
          uid: querySnapshot.docs[0].id, // Store UID for updates
          anweshaId: safeString(userDoc.anweshaId),
          firstName: safeString(userDoc.personal?.firstName + " " + userDoc.personal?.lastName || "N/A"),
          lastName: "",
          email: safeString(userDoc.email),
          contact: safeString(userDoc.contact || userDoc.personal?.phoneNumber),
          college: safeString(userDoc.college),
          dob: safeString(userDoc.personal?.dob),
          gender: safeString(userDoc.personal?.gender),
          // Add extra fields if available in DB but not in QR
          isDbResult: true,
          paymentStatus: safeString(userDoc.paymentStatus || "Unknown"),
          currentStatus: safeString(userDoc.movementStatus || "N/A")
        };
        setDecodedData(userData);
        setMovementStatus(userDoc.movementStatus || ""); // Pre-fill status if exists
        toast.success("User Found!");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error searching user");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!decodedData || !movementStatus) {
      toast.error("Please select a status first");
      return;
    }

    setSavingStatus(true);
    try {
      let uid = decodedData.uid;

      // If UID is missing (QR scan), find it first
      if (!uid && decodedData.anweshaId) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("anweshaId", "==", decodedData.anweshaId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          uid = snap.docs[0].id;
        }
      }

      if (!uid) {
        throw new Error("User record not found in database to update status.");
      }

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        movementStatus: movementStatus,
        lastMovementTime: serverTimestamp()
      });

      toast.success("Status Updated Successfully!");

      // Update local state to reflect change
      setDecodedData(prev => ({ ...prev, currentStatus: movementStatus }));

    } catch (err) {
      console.error(err);
      toast.error("Failed to update status: " + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  useEffect(() => {
    return () => stopScanner(); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/tajmahal_bg.jpg')] bg-cover bg-fixed p-4 font-sans">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-fade-in mt-20">

        {/* Header */}
        <div className="bg-[url('/bg_2_cropped.jpg')] bg-cover bg-center p-6 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-wider uppercase drop-shadow-md">
            User Validator
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === "scan"
                ? "bg-white text-rose-900 border-b-4 border-rose-900"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            onClick={() => setActiveTab("scan")}
          >
            Scan QR
          </button>
          <button
            className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === "search"
                ? "bg-white text-rose-900 border-b-4 border-rose-900"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            onClick={() => setActiveTab("search")}
          >
            Search Database
          </button>
        </div>

        <div className="p-8">
          {/* SCAN TAB */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <button
                  onClick={scannerActive ? stopScanner : startScanner}
                  className={`w-full py-3 rounded-xl text-xl font-bold text-white shadow-lg transition-transform transform hover:scale-[1.02] bg-cover bg-center ${scannerActive
                      ? "bg-red-600"
                      : "bg-[url('/bg_2_cropped.jpg')]"
                    }`}
                >
                  {scannerActive ? "Stop Camera" : "Open Camera Scanner"}
                </button>

                <div id="reader" className="w-full overflow-hidden rounded-xl"></div>

                <div className="relative">
                  
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/0 text-gray-500 bg-white">OR Enter Manually</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste QR Payload..."
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-900 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleVerifyQrManual}
                    className="bg-stone-800 text-white px-6 rounded-xl font-bold hover:bg-stone-900 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === "search" && (
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex gap-4 justify-center mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="anweshaId"
                    checked={searchType === "anweshaId"}
                    onChange={() => setSearchType("anweshaId")}
                    className="w-5 h-5 text-rose-900 focus:ring-rose-900"
                  />
                  <span className="text-lg font-medium text-gray-700">Anwesha ID</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="email"
                    checked={searchType === "email"}
                    onChange={() => setSearchType("email")}
                    className="w-5 h-5 text-rose-900 focus:ring-rose-900"
                  />
                  <span className="text-lg font-medium text-gray-700">Name & Email</span>
                </label>
              </div>

              {searchType === "anweshaId" ? (
                <input
                  type="text"
                  placeholder="Enter Anwesha ID (e.g. ANW-MUL-123456)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-900 focus:outline-none transition-colors"
                />
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name (Optional)"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-900 focus:outline-none transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-900 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xl font-bold text-white bg-[url('/bg_2_cropped.jpg')] bg-cover bg-center shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search User"}
              </button>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-pulse">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Result Display */}
          {decodedData && (
            <div className="mt-8 animate-fade-in-up">
              <div className="bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-32 h-32 text-stone-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="bg-green-600 text-white rounded-full p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </span>
                  {activeTab === 'scan' ? 'Valid QR Code' : 'User Found'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 relative z-10">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Anwesha ID</p>
                    <p className="text-lg font-bold text-rose-900">{decodedData.anweshaId}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Name</p>
                    <p className="text-lg font-semibold">{decodedData.firstName} </p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-lg font-mono text-gray-700 break-all">{decodedData.email}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">College</p>
                    <p className="text-md">{decodedData.college || "N/A"}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Contact</p>
                    <p className="text-md">{decodedData.contact || "N/A"}</p>
                  </div>
                  {decodedData.currentStatus && (
                    <div className="bg-white/60 p-3 rounded-lg md:col-span-2 border-l-4 border-rose-900">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status</p>
                      <p className="text-lg font-bold text-rose-900">{decodedData.currentStatus}</p>
                    </div>
                  )}
                </div>

                {decodedData.isDbResult && (
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <p className="text-sm text-stone-700 italic">
                      * Verified from Database
                    </p>
                  </div>
                )}
              </div>

              {/* MOVEMENT TRACKING CONTAINER */}
              <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-stone-200">
                <h3 className="text-xl font-bold text-stone-800 mb-4 border-b pb-2">Update Movement Status</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {["Entered College", "Exited College", "Entered CLH", "Exited CLH"].map((status) => (
                    <label
                      key={status}
                      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${movementStatus === status
                          ? "border-rose-900 bg-rose-50 text-rose-900"
                          : "border-gray-200 hover:border-rose-200"
                        }`}
                    >
                      <input
                        type="radio"
                        name="movementStatus"
                        value={status}
                        checked={movementStatus === status}
                        onChange={(e) => setMovementStatus(e.target.value)}
                        className="w-5 h-5 text-rose-900 focus:ring-rose-900 mr-3"
                      />
                      <span className="font-semibold">{status}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="w-full py-3 rounded-xl text-xl font-bold text-white bg-[url('/bg_2_cropped.jpg')] bg-cover bg-center shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingStatus ? "Saving..." : "Save Status"}
                </button>
              </div>

              {/* QR Preview for manual check */}
              {activeTab === 'scan' && (
                <div className="mt-6 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <QRCode value={qrInput} size={100} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
