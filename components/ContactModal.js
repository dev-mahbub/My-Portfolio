"use client";

import { useEffect } from "react";
import Icon from "@/components/Icons";

export default function ContactModal({ contact = {}, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.className === "modal-overlay" && onClose()}
    >
      <div className="modal">
        <div className="card-head" style={{ marginBottom: "0.75rem" }}>
          <h2>
            <Icon.Mail size={20} className="inline-ico" /> Let's connect
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <Icon.X size={18} />
          </button>
        </div>
        <p
          className="muted"
          style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}
        >
          Reach out via any channel below:
        </p>
        <ul className="contact-list">
          {contact.email && (
            <li className="contact-row">
              <Icon.Mail size={16} className="contact-ico" />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          )}
          {contact.phone && (
            <li className="contact-row">
              <Icon.Phone size={16} className="contact-ico" />
              <a href={`tel:${contact.phone}`}>{contact.phone}</a>
            </li>
          )}
          {contact.linkedin && (
            <li className="contact-row">
              <Icon.Linkedin size={16} className="contact-ico" />
              <a href={contact.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          )}
          {contact.github && (
            <li className="contact-row">
              <Icon.Github size={16} className="contact-ico" />
              <a href={contact.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
          )}
        </ul>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={onClose}>
            <Icon.Check size={16} /> Got it
          </button>
        </div>
      </div>
    </div>
  );
}
