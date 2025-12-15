"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import GreetingLottie from "../../../components/displaylottie";
import styles from "./campusamb.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

// 🔥 Firestore + Auth
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/context/AuthUserContext";
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function CampusAmbassador() {
    const router = useRouter();
    const { currentUser } = useAuthUser();

    const [showPopup, setShowPopup] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    // 🔍 Check registration status
    useEffect(() => {
        const checkRegistration = async () => {
            if (!currentUser) return;

            const ref = doc(db, "ca", currentUser.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) setAlreadyRegistered(true);
        };

        checkRegistration();
    }, [currentUser]);

    // 🟦 Register button clicked
    const handleRegisterClick = () => {
        if (!currentUser) {
            return router.push(`/login?from=${encodeURIComponent("/campusamb")}`);
        }
        setShowPopup(true);
    };

    // 🟩 Confirm Register
    const confirmRegister = async () => {
        try {
            await setDoc(doc(db, "ca", currentUser.uid), {
                userId: currentUser.uid,
                anweshaId: currentUser.anweshaId,
                name: `${currentUser.personal?.firstName} ${currentUser.personal?.lastName}`,
                email: currentUser.email,
                phone: currentUser.contact?.phone,
                college: currentUser.college?.name,
                registeredAt: new Date().toISOString(),
            });

            toast.success("Successfully registered as Campus Ambassador!");
            setAlreadyRegistered(true);
        } catch (err) {
            console.error(err);
            toast.error("Registration failed!");
        }

        setShowPopup(false);
    };

    useEffect(() => {
        document.body.style.overflowX = "hidden";
        return () => {
            document.body.style.overflowX = "visible";
        };
    }, []);

    return (
        <div className={clsx(styles.campusamb_body,"w-fit")}>
            <Head>
                <title>Anwesha 2024 - Campus Ambassador</title>
                <meta name="description" content="Campus Ambassador Program Anwesha 2024" />
                <link rel="icon" href="./logo_no_bg.svg" />
            </Head>

            {/* HERO SECTION */}
            <div className={styles.anwesha_bg_img}>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                    <div className={styles.anwesha_text}>
                        <Image
                            className={styles.anwesha_img}
                            src="/ca_anwesha_logo.svg"
                            width={400}
                            height={100}
                            alt="Anwesha Logo"
                        />
                    </div>
                </motion.div>

                <motion.div
                    className={styles.hero_text}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                >
                    <span className={styles.bgText}>CAMPUS AMBASSADOR</span>
                    <span className={styles.bgText_small}>PROGRAM</span>

                    <div style={{ display: "flex", height: "100px" }}>
                        {/* REGISTER BUTTON */}
                        <motion.div
                            className={styles.btn_register}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.8 }}
                        >
                            <button
                                onClick={handleRegisterClick}
                                className={styles.btn_text}
                                disabled={alreadyRegistered}
                            >
                                {alreadyRegistered ? "Registered ✓" : "Register"}
                            </button>
                        </motion.div>

                        {/* LEADERBOARD BUTTON */}
                        <motion.div
                            className={styles.btn_register}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.8 }}
                        >
                            <Link href="/leaderboard" className={styles.btn_text}>
                                Leaderboard
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* RESPONSIBILITIES SECTION */}
            <section className={styles.rulebook_section}>
                <div className={styles.responsibilities}>
                    <h1 className={styles.rulebook_text_heading}>Responsibilities</h1>

                    {/* Animation sections unchanged */}
                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0, x: "-100%" }}
                            whileInView={{ opacity: 1, x: "0%" }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets4.lottiefiles.com/packages/lf20_gegs7als.json" />
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                            <h2 className={styles.lottie_text}>Increase footfall from the college</h2>
                        </motion.div>
                    </div>
                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                {' '}
                                Increase the registration from the college
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets1.lottiefiles.com/packages/lf20_tpa51dr0.json" />
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets4.lottiefiles.com/packages/lf20_l2l6hr2l.json" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Social Media and Publicity
                            </h2>
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Hospitality: Facilitate campus visits and
                                auditions for Anwesha Team
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets4.lottiefiles.com/packages/lf20_e9zwg7jb.json" />
                        </motion.div>
                    </div>
                </div>

                {/* Perks */}
                <div className={styles.responsibilities}>
                    <h1 className={styles.rulebook_text_heading}>Perks</h1>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets3.lottiefiles.com/packages/lf20_0zv8teye.json" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Selfie with celebs
                            </h2>
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Campus Ambassador Certificate
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets9.lottiefiles.com/packages/lf20_rrvu3zea.json" />
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets6.lottiefiles.com/packages/lf20_gn0tojcq.json" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                CA Merchandise
                            </h2>
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Free Anwesha tickets and goodies
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets9.lottiefiles.com/packages/lf20_n0jeixzn.json" />
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets8.lottiefiles.com/packages/lf20_yzsAKLdwYm.json" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Learn management skills and interaction with
                                talented people
                            </h2>
                        </motion.div>
                    </div>

                    <div className={styles.lottie_row}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className={styles.lottie_text}>
                                Top 3 CA's name will feature on Anwesha social
                                media handles
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets6.lottiefiles.com/packages/lf20_tduixm8u.json" />
                        </motion.div>
                    </div>
                </div>

                {/* Judging Criteria */}
                <div className={styles.responsibilities}>
                    <h1 className={styles.rulebook_text_heading}>
                        Judging Criteria
                    </h1>
                    <div className={styles.lottie_row_judging}>
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets9.lottiefiles.com/packages/lf20_LDP1qTExIJ.json" />
                        </motion.div>
                        <motion.table
                            className={styles.points_table}
                            initial={{ opacity: 0, x: '100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                        >
                            <tbody>
                                <tr>
                                    <th className={styles.table_heading}>
                                        Condition
                                    </th>
                                    <th className={styles.table_heading}>
                                        Points
                                    </th>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Online Registration
                                    </td>
                                    <td className={styles.tablecol2}>15xp</td>
                                </tr>

                                <tr>
                                    <td className={styles.tablecol1}>
                                        Offline Registration
                                    </td>
                                    <td className={styles.tablecol2}>30xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Instagram Story
                                    </td>
                                    <td className={styles.tablecol2}>5xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Instagram Post
                                    </td>
                                    <td className={styles.tablecol2}>10xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Putting poster/banner
                                    </td>
                                    <td className={styles.tablecol2}>15xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Share messages on WA groups<sup>*</sup>
                                    </td>
                                    <td className={styles.tablecol2}>5xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Putting a WA status
                                    </td>
                                    <td className={styles.tablecol2}>5xp</td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Creative way of incorporating glimpses
                                        of Anwesha
                                    </td>
                                    <td className={styles.tablecol2}>
                                        10-30xp
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.tablecol1}>
                                        Hospitality
                                    </td>
                                    <td className={styles.tablecol2}>
                                        10-30xp
                                    </td>
                                </tr>
                            </tbody>
                        </motion.table>
                    </div>
                </div>
                {/* Rewards */}
                <div className={styles.responsibilities}>
                    <h1 className={styles.rulebook_text_heading}>Rewards</h1>
                    <div className={styles.lottie_row}>
                        <div>
                            <motion.h3
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_heading}
                            >
                                Best CA
                            </motion.h3>
                            <motion.h4
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_desc}
                            >
                                Best CA sash + Hoodie + surprise gifts
                            </motion.h4>
                            <motion.h3
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_heading}
                            >
                                Top 5 CA
                            </motion.h3>
                            <motion.h4
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_desc}
                            >
                                Appreciation on social Media Handles + surprise
                                gifts
                            </motion.h4>
                            <motion.h3
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_heading}
                            >
                                Top 10 CA
                            </motion.h3>
                            <motion.h4
                                initial={{ opacity: 0, x: '-100%' }}
                                whileInView={{ opacity: 1, x: '0%' }}
                                transition={{ duration: 0.3 }}
                                className={styles.reward_desc}
                            >
                                Suitable prizes
                            </motion.h4>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: '-100%' }}
                            whileInView={{ opacity: 1, x: '0%' }}
                            transition={{ duration: 0.3 }}
                            className={styles.lottie_container}
                        >
                            <GreetingLottie animationPath="https://assets4.lottiefiles.com/private_files/lf30_a4mKwA.json" />
                        </motion.div>
                    </div>
                </div>
            </section>

             {/* 🔽 POPUP CONFIRMATION */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]">
                    <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm text-center shadow-lg">
                        <h2 className="text-xl font-semibold mb-3">Confirm Registration</h2>
                        <p>Register as Campus Ambassador?</p>

                        <div className="mt-5 flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:opacity-80"
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90"
                                onClick={confirmRegister}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
