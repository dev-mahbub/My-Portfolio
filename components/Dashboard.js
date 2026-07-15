"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import OnlineCvCard from "@/components/OnlineCvCard";
import CoverLetterCard from "@/components/CoverLetterCard";
import AnalyticsCard from "@/components/AnalyticsCard";
import EditPanel from "@/components/EditPanel";
import Toast from "@/components/Toast";
import Icon from "@/components/Icons";

/**
 * Admin Dashboard (separate page, /dashboard).
 *
 * Contains — admin only:
 *   • Online CV editor (dashboard_content.cv_text)
 *   • Cover Letter editor (dashboard_content.cover_letter)
 *   • Downloadable CV management (public_files) — separate from online text
 *   • Visitor Analytics (visitor_tracking)
 *   • Change Credentials (via Topbar dropdown)
 *
 * If a non-authenticated visitor lands here, they are redirected to "/".
 */
export default function Dashboard({ initialData = {}, initialAuthed = false }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [authed, setAuthed] = useState(initialAuthed);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [cvFile, setCvFile] = useState(initialData?.downloadCv || null);
  const [uploadingCv, setUploadingCv] = useState(false);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  }, []);

  // Guard: if not authed, kick back to public page
  useEffect(() => {
    if (!initialAuthed) {
      router.replace("/");
    }
  }, [initialAuthed, router]);

  const saveSection = useCallback(
    async (section, value) => {
      try {
        const res = await fetch(`/api/portfolio/${section}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
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

  // Upload a standalone downloadable CV PDF (public_files)
  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "cv");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setCvFile({ url: json.url, originalName: file.name });
      showToast("Downloadable CV updated");
    } catch (err) {
      showToast("Upload failed: " + err.message, true);
    } finally {
      setUploadingCv(false);
    }
  };

  if (!authed) return null;

  return (
    <>
      <Topbar
        profile={data.profile || {}}
        authed={authed}
        data={data}
        onLogin={() => setAuthed(true)}
        onLogout={() => {
          setAuthed(false);
          router.replace("/");
        }}
      />

      <main className="app-shell dashboard-shell">
        <div className="dashboard-wide">
          <div className="dashboard-head">
            <h1>
              <Icon.Briefcase size={22} className="inline-ico" /> Admin
              Dashboard
            </h1>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Manage your online CV text, cover letter, downloadable CV PDF, and
              visitor analytics. Public visitors cannot see this page.
            </p>
          </div>

          {/* === Downloadable CV (standalone PDF, separate from online text) === */}
          <section className="card">
            <div className="card-head">
              <h2>
                <Icon.FileText size={18} className="inline-ico" /> Downloadable
                CV (PDF)
              </h2>
            </div>
            <p
              className="muted"
              style={{ fontSize: "0.8rem", marginBottom: "0.6rem" }}
            >
              This is the standalone PDF served by the public{" "}
              <strong>"View CV"</strong> button. It is completely independent of
              the editable Online CV text below.
            </p>

            {cvFile?.url ? (
              <div
                className="upload-preview"
                style={{ marginBottom: "0.6rem" }}
              >
                Active CV:{" "}
                <a href={cvFile.url} target="_blank" rel="noreferrer">
                  {cvFile.originalName || cvFile.url}
                </a>
              </div>
            ) : (
              <p className="muted" style={{ marginBottom: "0.6rem" }}>
                No PDF uploaded yet. A default ATS-friendly CV will be generated
                automatically if none is uploaded.
              </p>
            )}

            <label className="upload-box">
              {uploadingCv ? (
                "Uploading..."
              ) : (
                <>
                  <Icon.Upload size={16} /> Upload new CV (PDF) — replaces the
                  current one
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleCvUpload}
                disabled={uploadingCv}
              />
            </label>
          </section>

          {/* === Online CV text editor === */}
          <OnlineCvCard
            cvText={data.cv_text}
            authed
            onEdit={() => setEditing("cv_text")}
          />

          {/* === Cover Letter editor === */}
          <CoverLetterCard
            coverLetter={data.cover_letter}
            authed
            onEdit={() => setEditing("cover_letter")}
          />

          {/* === Visitor Analytics === */}
          <AnalyticsCard authed />
        </div>
      </main>

      {editing && (
        <EditPanel
          section={editing}
          data={data}
          onClose={() => setEditing(null)}
          onSave={saveSection}
        />
      )}

      {toast && <Toast message={toast.msg} isError={toast.isError} />}
    </>
  );
}
