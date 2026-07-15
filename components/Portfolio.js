"use client";

import { useState, useCallback, useEffect } from "react";
import Topbar from "@/components/Topbar";
import ProfileCard from "@/components/ProfileCard";
import SkillsCard from "@/components/SkillsCard";
import AboutCard from "@/components/AboutCard";
import ExperienceCard from "@/components/ExperienceCard";
import ProjectsCard from "@/components/ProjectsCard";
import EducationCard from "@/components/EducationCard";
import HighlightsCard from "@/components/HighlightsCard";
import ContactCard from "@/components/ContactCard";
import LanguagesCard from "@/components/LanguagesCard";
import ContactModal from "@/components/ContactModal";
import Toast from "@/components/Toast";
import EditPanel from "@/components/EditPanel";

export default function Portfolio({ initialData, initialAuthed = false }) {
  const [data, setData] = useState(initialData);
  const [authed, setAuthed] = useState(initialAuthed);
  const [contactOpen, setContactOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ---- Visitor Tracking (fire once on mount) ----
  useEffect(() => {
    try {
      const urlObj = new URL(window.location.href);
      const ref = urlObj.searchParams.get("ref") || null;
      const sessionId =
        window.localStorage.getItem("pv_sid") ||
        (() => {
          const id = "v_" + Math.random().toString(36).slice(2, 12);
          window.localStorage.setItem("pv_sid", id);
          return id;
        })();
      fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: urlObj.pathname + urlObj.search,
          ref,
          sessionId,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, []);

  const saveSection = useCallback(
    async (section, value) => {
      try {
        const res = await fetch(`/api/portfolio/${section}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
        if (res.status === 401) {
          showToast("Please log in to edit", true);
          return;
        }
        if (!res.ok) throw new Error("Save failed");
        const json = await res.json();
        setData(json.data);
        showToast("Saved");
        setEditing(null);
      } catch (e) {
        showToast("Save failed", true);
      }
    },
    [showToast],
  );

  const uploadFile = useCallback(
    async (file, type) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type || "cover");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.status === 401) {
        showToast("Please log in to upload", true);
        return null;
      }
      if (!res.ok) {
        showToast("Upload failed", true);
        return null;
      }
      const json = await res.json();
      showToast("Uploaded");
      return json.url;
    },
    [showToast],
  );

  return (
    <>
      <Topbar
        profile={data.profile}
        authed={authed}
        data={data}
        onLogin={() => {
          setAuthed(true);
          showToast("Welcome back, admin");
        }}
        onLogout={() => {
          setAuthed(false);
          setEditing(null);
          showToast("Signed out");
        }}
      />

      <main className="app-shell">
        <aside className="left-col">
          <ProfileCard
            profile={data.profile}
            authed={authed}
            onContact={() => setContactOpen(true)}
            onEdit={() => setEditing("profile")}
          />
          <SkillsCard
            skills={data.skills}
            authed={authed}
            onEdit={() => setEditing("skills")}
          />
          <LanguagesCard
            languages={data.languages}
            authed={authed}
            onEdit={() => setEditing("languages")}
          />
        </aside>

        <section className="right-col">
          <AboutCard
            profile={data.profile}
            authed={authed}
            onEdit={() => setEditing("profile")}
          />
          <ExperienceCard
            experience={data.experience || []}
            authed={authed}
            onEdit={() => setEditing("experience")}
          />
          <ProjectsCard
            projects={data.projects}
            authed={authed}
            onEdit={() => setEditing("projects")}
          />
          <EducationCard
            education={data.education || []}
            authed={authed}
            onEdit={() => setEditing("education")}
          />
          <HighlightsCard
            highlights={data.highlights}
            authed={authed}
            onEdit={() => setEditing("highlights")}
          />
          <ContactCard
            contact={data.contact}
            authed={authed}
            onEdit={() => setEditing("contact")}
          />
          <footer className="footer">
            © {new Date().getFullYear()} {data.profile.name} — Portfolio
          </footer>
        </section>
      </main>

      {contactOpen && (
        <ContactModal
          contact={data.contact}
          onClose={() => setContactOpen(false)}
        />
      )}

      {editing && (
        <EditPanel
          section={editing}
          data={data}
          onClose={() => setEditing(null)}
          onSave={saveSection}
          onUpload={uploadFile}
        />
      )}

      {toast && <Toast message={toast.msg} isError={toast.isError} />}
    </>
  );
}
