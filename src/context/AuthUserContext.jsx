"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export function AuthUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // to search by anwesha id
  const searchByAnweshaId = async (anweshaId) => {
    try {
      const q = query(
        collection(db, "users"),
        where("anweshaId", "==", anweshaId)
      );

      const snap = await getDocs(q);

      if (snap.empty) return null;

      return snap.docs[0].data();
    } catch (err) {
      console.error("Search by Anwesha ID failed:", err);
      return null;
    }
  };

  // 🔹 Listen for login/logout state
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setCurrentUser(snap.data()); // includes role from Firestore
      } else {
        // fallback minimal user (should not normally happen)
        setCurrentUser({
          uid: currentUser?.uid || (auth.currentUser?.uid ?? null),
          email: user.email,
          role: "user",
          emailVerified: user.emailVerified,
          status: "1",
        });
      }

      setLoading(false);
    });
  }, []);

  // 🔹 REGISTER USER
  const registerUser = async (email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // ⭐ Default role assigned as "user"
      const userDoc = {
        uid,
        email,
        role: "user",
        emailVerified: res.user.emailVerified || false,
        status: "1",
        anweshaId: null,
        createdAt: Date.now(),
        personal: {},
        college: {},
        events: [],
        qrEnabled: false,
        qrTokenId: null,
      };

      await setDoc(doc(db, "users", uid), userDoc);
      setCurrentUser(userDoc);

      toast.success("Account Created!");
      return userDoc;
    } catch (err) {
      console.log("REGISTER ERR", err);

      if (err.code === "auth/email-already-in-use") {
        return await loginUser(email, password);
      }

      toast.error(err.message);
      return null;
    }
  };

  // 🔹 LOGIN USER
  const loginUser = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = res.user;

      await firebaseUser.reload();

      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("User record missing!");
        throw new Error("Firestore user missing");
      }

      const userData = snap.data();

      if (userData.status !== "successful") {
        throw new Error("Please complete registration first.");
      }

      // sync verified status if email is verified
      if (firebaseUser.emailVerified) {
        await updateDoc(ref, { emailVerified: true });
      }

      localStorage.setItem("uid", firebaseUser.uid);
      setCurrentUser(userData);

      toast.success("Login Successful");
      return userData;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

  // 🔹 LOGOUT
  const logoutUser = async () => {
    await signOut(auth);
    localStorage.removeItem("uid");
    setCurrentUser(null);
    toast.success("Logged Out");
  };

  // 🔹 UPDATE USER FIRESTORE DATA
  const updateUser = async (uid, newData) => {
    await updateDoc(doc(db, "users", uid), newData);

    // update React state
    setCurrentUser((prev) => ({ ...prev, ...newData }));
    return { ...currentUser, ...newData };
  };

  // 🔹 FINALIZE REGISTRATION
  const finalizeRegistration = async (uid, formData = {}) => {
    const anweshaId = `ANW-MUL-${Math.floor(100000 + Math.random() * 900000)}`;

    await updateUser(uid, {
      anweshaId,
      status: "successful",
      ...formData,
    });

    return anweshaId;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        updateUser,
        finalizeRegistration,
        searchByAnweshaId,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🔹 custom hook
export const useAuthUser = () => useContext(AuthContext);
