"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import Link from "next/link";
import Image from "next/image";
import { useAuthUser } from "@/context/AuthUserContext";
import { useRouter, usePathname } from "next/navigation";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { toast } from "react-hot-toast";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";

const STATE_MACHINE_NAME = "Basic State Machine";
const INPUT_NAME = "Switch";
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Navigation() {
  const { currentUser, logoutUser } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const refNav = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: "/navbar/hamburger-time.riv",
    autoplay: true,
    stateMachines: STATE_MACHINE_NAME,
  });

  const toggleInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showDropdown]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      if (refNav.current && !refNav.current.contains(e.target)) {
        closeDrawer();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [drawerOpen]);

  useEffect(() => closeDrawer(), [pathname]);

  const toggleDrawer = () => {
    const drawer = document.getElementById("drawer");
    const nav = document.getElementById("nav_div");
    if (!drawer || !nav) return;

    if (!drawerOpen) {
      drawer.style.display = "block";
      nav.style.backgroundColor = "#000";
      setTimeout(() => (drawer.style.opacity = 1), 50);
    } else closeDrawer();

    setDrawerOpen(!drawerOpen);
    toggleInput?.fire();
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("drawer");
    const nav = document.getElementById("nav_div");
    if (!drawer) return;

    drawer.style.opacity = 0;
    setTimeout(() => {
      drawer.style.display = "none";
      if (nav) nav.style.backgroundColor = "";
    }, 200);

    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setShowDropdown(false);
    closeDrawer();
    toast.success("Logged out!");
  };

  return (
    <>
      <div id="nav_div" className={styles.mainNav} ref={refNav}>
        {/* Hamburger */}
        <div className={styles.hamburger}>
          <RiveComponent onClick={toggleDrawer} />
        </div>

        {/* Logo */}
        <Link href="/" className={styles.navLogo}>
          <Image src="/navbar/logo_no_bg.svg" alt="logo" width={108} height={45} />
        </Link>

        {/* Desktop Links */}
        <div className={styles.navLinks}>
          <ul>
            <li><Link className={styles.linknav} href="/events">Events</Link></li>
            <li><Link className={styles.linknav} href="/multicity">Multicity</Link></li>
            <li><Link className={styles.linknav} href="/gallery">Gallery</Link></li>
            <li><Link className={styles.linknav} href="/team">Team</Link></li>
            <li><Link className={styles.linknav} href="/sponsors">Sponsors</Link></li>
            <li><Link className={styles.linknav} href="/about">About</Link></li>
            <li><Link className={styles.linknav} href="/contact">Contact</Link></li>
            <li><Link className={styles.linknav} href="/campus-ambassador">Campus Ambassador</Link></li>
            <li><Link className={styles.linknav} href="/store">Store</Link></li>
          </ul>
        </div>

        {/* Desktop Right */}
        <div className={cn(styles.navEnds, "mr-14", "gap-2")}>

          {/* GET PASSES (DESKTOP ONLY) */}
          <button
            className={cn(styles.sexy_button, styles.sexy_button_small)}
            onClick={() => router.push("/anweshapass")}
          >
            GET PASSES
          </button>

          {/* LOGIN (DESKTOP ONLY, logged out) */}
          {!currentUser && (
            <button
              className={cn(styles.sexy_button, styles.sexy_button_small)}
              onClick={() => router.push(`/login?from=${encodeURIComponent(pathname)}`)}
            >
              LOGIN
            </button>
          )}

          {/* PROFILE + CART (DESKTOP, logged in) */}
          {currentUser && (
            <div
              className="relative flex items-center gap-2 "
              ref={dropdownRef}
              // onMouseEnter={() => setShowDropdown(true)}
              // onMouseLeave={() => setShowDropdown(false)}
            >
              <FaShoppingCart
                size={28}
                color="white"
                style={{ cursor: "pointer", marginRight: "12px" }}
                onClick={() => router.push("/checkout")}
              />

              <FaUserCircle
                size={28}
                color="white"
                style={{ cursor: "pointer" }}
                onClick={() => setShowDropdown(prev => !prev)}
              />

              {showDropdown && (
                <ul className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-black shadow-lg text-white">

                  {/* PROFILE */}
                  <li>
                    <button
                      className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/profile");
                      }}
                    >
                      Profile
                    </button>
                  </li>

                  {/* ADMIN */}
                  {currentUser?.role === "admin" && (
                    <>
                      <li className="mt-2">
                        <button
                          className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                          onClick={() => {
                            setShowDropdown(false);
                            router.push("/admin");
                          }}
                        >
                          Admin Panel
                        </button>
                      </li>

                      <li className="mt-2">
                        <button
                          className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                          onClick={() => {
                            setShowDropdown(false);
                            router.push("/editor");
                          }}
                        >
                          Editor Panel
                        </button>
                      </li>
                    </>
                  )}

                  {/* EDITOR */}
                  {currentUser?.role === "editor" && (
                    <li className="mt-2">
                      <button
                        className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push("/editor");
                        }}
                      >
                        Editor Panel
                      </button>
                    </li>
                  )}

                  {/* LOGOUT */}
                  <li className="mt-3">
                    <button
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}

            </div>
          )}
        </div>

        {/* MOBILE ICONS (logged in only) */}
        {currentUser && (
          <div
            // className={styles.mobile_only}
            className="flex lg:hidden gap"
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              gap: "18px",
              zIndex: 20,
            }}
          >
            <FaShoppingCart
              size={28}
              color="white"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/checkout")}
            />
            <FaUserCircle
              size={28}
              color="white"
              style={{ cursor: "pointer" }}
              onClick={() => setShowDropdown(prev => !prev)}
            />
                          {showDropdown && (
                <ul className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-black shadow-lg text-white">

                  {/* PROFILE */}
                  <li>
                    <button
                      className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/profile");
                      }}
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/orders");
                      }}
                    >
                      Orders
                    </button>
                  </li>

                  {/* ADMIN */}
                  {currentUser?.role === "admin" && (
                    <>
                      <li className="mt-2">
                        <button
                          className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                          onClick={() => {
                            setShowDropdown(false);
                            router.push("/admin");
                          }}
                        >
                          Admin Panel
                        </button>
                      </li>

                      <li className="mt-2">
                        <button
                          className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                          onClick={() => {
                            setShowDropdown(false);
                            router.push("/editor");
                          }}
                        >
                          Editor Panel
                        </button>
                      </li>
                    </>
                  )}

                  {/* EDITOR */}
                  {currentUser?.role === "editor" && (
                    <li className="mt-2">
                      <button
                        className="w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-600 rounded-xl"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push("/editor");
                        }}
                      >
                        Editor Panel
                      </button>
                    </li>
                  )}

                  {/* LOGOUT */}
                  <li className="mt-3">
                    <button
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <div id="drawer" className={styles.nav_drawer}>
        <ul>
          <li><Link href="/" onClick={toggleDrawer}>Home</Link></li>
          <li><Link href="/events" onClick={toggleDrawer}>Events</Link></li>
          <li><Link href="/gallery" onClick={toggleDrawer}>Gallery</Link></li>
          <li><Link href="/team" onClick={toggleDrawer}>Team</Link></li>
          <li><Link href="/sponsors" onClick={toggleDrawer}>Sponsors</Link></li>
          <li><Link href="/about" onClick={toggleDrawer}>About</Link></li>
          <li><Link href="/contact" onClick={toggleDrawer}>Contact</Link></li>
          <li><Link href="/campus-ambassador" onClick={toggleDrawer}>Campus Ambassador</Link></li>
          <li><Link href="/store" onClick={toggleDrawer}>Store</Link></li>
          <li><Link href="/anweshapass" onClick={toggleDrawer}>Get Passes</Link></li>

          {!currentUser && (
            <li><Link href="/login" onClick={toggleDrawer}>Login</Link></li>
          )}

          {/* {currentUser && (
            <li>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </li>
          )} */}
        </ul>
      </div>
    </>
  );
}

export default Navigation;
