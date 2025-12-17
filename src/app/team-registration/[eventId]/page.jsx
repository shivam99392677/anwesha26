"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuthUser } from "@/context/AuthUserContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

export default function TeamRegistrationPage() {
  const { eventId } = useParams();
  const router = useRouter();

  const { currentUser, searchByAnweshaId, loading } = useAuthUser();
  const { addToCart } = useCart();

  const [event, setEvent] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [team, setTeam] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [proceedLoading, setProceedLoading] = useState(false);

  // 🔹 Fetch event
  useEffect(() => {
    async function fetchEvent() {
      const ref = doc(db, "events", eventId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Event not found");
        router.push("/events");
        return;
      }

      setEvent({ id: snap.id, ...snap.data() });
    }

    fetchEvent();
  }, [eventId, router]);

  // 🔹 Auto-add current user as team leader
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/userLogin");
      return;
    }

    if (
      currentUser?.anweshaId &&
      !team.some((m) => m.anweshaId === currentUser.anweshaId)
    ) {
      setTeam([currentUser]);
    }
  }, [currentUser, loading, router, team.length]);

  // 🔍 Search Anwesha ID
  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setSearchLoading(true);
    setFoundUser(null);

    try {
      const user = await searchByAnweshaId(searchId.trim().toUpperCase());
      if (!user) {
        toast.error("No user found with this Anwesha ID");
      }
      setFoundUser(user);
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  // ➕ Add member
  const handleAddMember = () => {
    if (!foundUser) return;

    if (team.some((m) => m.anweshaId === foundUser.anweshaId)) {
      toast.error("Member already in team");
      return;
    }

    if (team.length >= event.max_team_size) {
      toast.error(`Max ${event.max_team_size} members allowed`);
      return;
    }

    setTeam([...team, foundUser]);
    setFoundUser(null);
    setSearchId("");
  };

  // ❌ Remove member (except leader)
  const handleRemove = (anweshaId) => {
    if (anweshaId === currentUser.anweshaId) return;
    setTeam(team.filter((m) => m.anweshaId !== anweshaId));
  };

  // ▶ Proceed to checkout
  const handleProceed = async () => {
    if (!teamName.trim()) {
      return toast.error("Enter team name");
    }

    if (
      team.length < event.min_team_size ||
      team.length > event.max_team_size
    ) {
      return toast.error("Invalid team size");
    }

    const anweshaIds = team.map((m) => m.anweshaId);

    setProceedLoading(true);

    try {
      // ✅ Backend validation
      const res = await fetch("/api/events/validate-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          anweshaIds,
          minSize: event.min_team_size,
          maxSize: event.max_team_size,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message);
      }

      // ✅ Add to cart
      addToCart({
        id: event.id,
        name: event.name,
        cost: Number(event.registration_fee || 0),
        quantity: 1,
        type: "event",
        eventCategory: event.category,
        team: {
          name: teamName,
          members: anweshaIds,
        },
      });

      toast.success("Team validated");
      router.push("/checkout");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setProceedLoading(false);
    }
  };

  if (!event || loading) {
    return <div className="text-center text-white mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-32 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {event.name} – Team Registration
        </h1>

        <div className="bg-[#121212] p-6 rounded-xl border border-gray-700">
          {/* Team Name */}
          <label className="block mb-2 text-gray-300">Team Name</label>
          <input
            className="w-full p-3 mb-4 rounded-lg bg-[#0f0f0f] border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
          />

          {/* Search */}
          <label className="block mb-2 text-gray-300">
            Add Team Members (Anwesha ID)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 p-3 rounded-lg bg-[#0f0f0f] border border-gray-600"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="ANW-XXXXXX"
            />
            <button
              onClick={handleSearch}
              className="px-4 bg-red-600 rounded-lg"
            >
              {searchLoading ? "..." : "Search"}
            </button>
          </div>

          {/* Found user */}
          {foundUser && (
            <div className="mb-4 p-3 border border-gray-600 rounded">
              <p className="font-semibold">
                {foundUser.firstName} {foundUser.lastName}
              </p>
              <p className="text-sm">{foundUser.email}</p>
              <p className="text-sm">{foundUser.anweshaId}</p>
              <button
                onClick={handleAddMember}
                className="mt-2 bg-green-600 px-3 py-1 rounded"
              >
                Add to Team
              </button>
            </div>
          )}

          {/* Team list */}
          <h2 className="text-lg font-semibold mb-2">Team Members</h2>
          <ul className="mb-4 space-y-2">
            {team.map((m) => (
              <li
                key={m.anweshaId}
                className="flex justify-between items-center bg-[#0f0f0f] p-2 rounded"
              >
                <span>
                  {m.firstName} {m.lastName} ({m.anweshaId})
                </span>
                {m.anweshaId !== currentUser.anweshaId && (
                  <button
                    onClick={() => handleRemove(m.anweshaId)}
                    className="text-red-400 text-sm"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          <p className="text-sm text-gray-400 mb-4">
            Team size: {event.min_team_size} – {event.max_team_size}
          </p>

          <button
            onClick={handleProceed}
            disabled={proceedLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            {proceedLoading ? "Validating..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
