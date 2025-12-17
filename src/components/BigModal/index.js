"use client";

import React from "react";
import { useAuthUser } from "../../context/AuthUserContext";
import {
  soloEventRegistration,
  soloEventRegistrationiitp,
} from "../Event Registration/soloEventRegistration";
import { ToastContainer, toast } from "react-toastify";
import styles from "./Modal.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const Modal = (props) => {
  const router = useRouter();
  const { currentUser, loading } = useAuthUser(); // FIXED

  const { addToCart } = useCart();

  function handleRagister() {
    if (loading) return;

    if (!currentUser) {
      return router.push("/userLogin");
    }

    if (!props.body.is_active) {
      return toast.info("Registration Closed!");
    }

    // SOLO EVENT
    if (props.body.is_solo) {
      addToCart({
        id: props.body.id,
        name: props.body.name,
        cost: Number(props.body.registration_fee || 0),
        quantity: 1,
        type: "event",
      });

      router.push("/checkout");
      return;
    }

    // TEAM EVENT
    router.push(`/team-registration/${props.body.id}`);
  }

  const description = (props.body.description || "").replace(/\n/g, "<br />");

  return (
    <>
      <ToastContainer />
      <div id="backdrop" className={styles.modal} onClick={props.closeHandler}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_head}>
            <h1>{props.title}</h1>
            <Image
              src="/events/close.svg"
              alt="Close"
              height={40}
              width={40}
              onClick={props.closeHandler}
              style={{ cursor: "pointer" }}
            />
          </div>

          <hr style={{ width: "100%", height: "2px", marginBottom: "35px" }} />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              columnGap: "30px",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-evenly",
              overflowY: "scroll",
              paddingBottom: "50px",
            }}
          >
            <div className={styles.leftColumn}>
              <img
                src={props.body.poster || "/events/poster.png"}
                alt="poster"
                width={220}
                height={220}
                style={{ borderRadius: "15px" }}
              />

              {props.body.video && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btn}
                  href={props.body.video}
                >
                  Rulebook
                </a>
              )}

              <button className={styles.btn} onClick={handleRagister}>
                Register
              </button>
            </div>

            <div className={styles.modal_body}>
              <div className={styles.date_venue}>
                <span className={styles.date_text}>Date:</span>
                <span className={styles.date_value}>
                  {props.body.start_time
                    ? new Date(props.body.start_time).toLocaleDateString()
                    : "TBA"}
                </span>

                <br />
                <span className={styles.date_text}>Venue:</span>
                <span className={styles.date_value}>{props.body.venue}</span>
              </div>

              <p
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: description }}
              />

              <div className={styles.team_pay}>
                <div style={{ fontWeight: "600" }}>
                  {props.body.max_team_size === 1
                    ? "Individual Participation"
                    : `${props.body.max_team_size} members`}
                </div>

                {props.body.registration_fee && (
                  <p>
                    Registration Fee&nbsp;
                    <span style={{ fontWeight: "600" }}>
                      ₹{props.body.registration_fee}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
