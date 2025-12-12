"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import Link from "next/link";
import Image from "next/image";
import { useAuthUser } from "@/context/AuthUserContext";
import { useRouter, usePathname } from "next/navigation";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { toast } from "react-hot-toast";

const STATE_MACHINE_NAME = "Basic State Machine";
const INPUT_NAME = "Switch";
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Navigation() {
  const { currentUser, logoutUser } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: "/navbar/hamburger-time.riv",
    autoplay: true,
    stateMachines: STATE_MACHINE_NAME,
  });

  const toggleInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);
  const refNav = useRef(null);

  useEffect(() => closeDrawer(), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleOutside(e) {
      if (refNav.current && !refNav.current.contains(e.target)) {
        closeDrawer();
      }
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [drawerOpen]);

  const toggleDrawer = () => {
    const drawer = document.getElementById("drawer");
    const nav_div = document.getElementById("nav_div");
    if (!drawer || !nav_div) return;

    if (!drawerOpen) {
      drawer.style.display = "block";
      nav_div.style.backgroundColor = "#000";
      setTimeout(() => (drawer.style.opacity = 1), 50);
    } else {
      closeDrawer();
    }
    setDrawerOpen(!drawerOpen);
    toggleInput?.fire();
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("drawer");
    const nav_div = document.getElementById("nav_div");
    if (!drawer) return;

    drawer.style.opacity = 0;
    setTimeout(() => {
      drawer.style.display = "none";
      if (nav_div) nav_div.style.backgroundColor = "";
    }, 200);

    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
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
        <Link
          href="/"
          className={styles.navLogo}
          onClick={() => drawerOpen && toggleInput?.fire()}
        >
          <Image src="/navbar/logo_no_bg.svg" alt="logo" width={108} height={45} />
        </Link>

        {/* Desktop Nav */}
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
          </ul>
        </div>

        {/* Desktop Action Buttons */}
        <div className={styles.navEnds}>
          <button className={cn(styles.sexy_button, styles.sexy_button_small)}
            onClick={() => router.push("/anweshapass")}>
            GET PASSES
          </button>

          {/* Show Admin Panel + Editor Panel like GET PASSES */}
          {currentUser?.role === "admin" && (
            <>
              <button className={cn(styles.sexy_button, styles.sexy_button_small)}
                onClick={() => router.push("/admin")}>
                ADMIN PANEL
              </button>

              <button className={cn(styles.sexy_button, styles.sexy_button_small)}
                onClick={() => router.push("/editor")}>
                EDITOR PANEL
              </button>
            </>
          )}

          {currentUser?.role === "editor" && (
            <button className={cn(styles.sexy_button, styles.sexy_button_small)}
              onClick={() => router.push("/editor")}>
              EDITOR PANEL
            </button>
          )}

          <button className={cn(styles.sexy_button, styles.sexy_button_small)}
            onClick={() =>
              currentUser
                ? router.push("/profile")
                : router.push(`/login?from=${encodeURIComponent(pathname)}`)
            }>
            {!currentUser ? "LOGIN" : "PROFILE"}
          </button>

          {currentUser && (
            <button className={cn(styles.sexy_button, styles.sexy_button_small)}
              onClick={handleLogout}>
              LOGOUT
            </button>
          )}
        </div>
      </div>

      {/* Drawer (Mobile Menu) */}
      <div id="drawer" className={styles.nav_drawer}>
        <ul>
          <li><Link href="/" onClick={toggleDrawer}>Home</Link></li>
          {currentUser && <li><Link href="/profile" onClick={toggleDrawer}>Profile</Link></li>}
          <li><Link href="/events" onClick={toggleDrawer}>Events</Link></li>
          <li><Link href="/gallery" onClick={toggleDrawer}>Gallery</Link></li>
          <li><Link href="/team" onClick={toggleDrawer}>Team</Link></li>
          <li><Link href="/sponsors" onClick={toggleDrawer}>Sponsors</Link></li>
          <li><Link href="/about" onClick={toggleDrawer}>About</Link></li>
          <li><Link href="/contact" onClick={toggleDrawer}>Contact</Link></li>
          <li><Link href="/campus-ambassador" onClick={toggleDrawer}>Campus Ambassador</Link></li>
          <li><Link href="/anweshapass" onClick={toggleDrawer}>Get Passes</Link></li>

          {/* Mobile Role Buttons */}
          {currentUser?.role === "admin" && (
            <>
              <li><Link href="/admin" onClick={toggleDrawer}>Admin Panel</Link></li>
              <li><Link href="/editor" onClick={toggleDrawer}>Editor Panel</Link></li>
            </>
          )}

          {currentUser?.role === "editor" && (
            <li><Link href="/editor" onClick={toggleDrawer}>Editor Panel</Link></li>
          )}

          {/* User Info */}
          <li>
            {currentUser ? (
              <div className={styles.user_container}>
                <Link href="/profile" onClick={toggleDrawer}>
                  <div>
                    <span className={styles.user_name}>{currentUser?.personal?.fullName}</span>
                    <span className={styles.user_id}>{currentUser?.anweshaId}</span>
                  </div>
                </Link>
                <Image src="/assets/logout.svg" height={40} width={40} alt="logout" className={styles.logout}
                  onClick={handleLogout} />
              </div>
            ) : (
              <Link href="/login" onClick={toggleDrawer}>LOGIN</Link>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navigation;
