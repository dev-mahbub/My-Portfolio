"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import AnalyticsCard from "@/components/AnalyticsCard";
import Toast from "@/components/Toast";
import Icon from "@/components/Icons";

/**
 * Admin Dashboard (separate page, /dashboard).
 *
 * Contains — admin only:
 *   • Downloadable CV management (public_files) — served by the public
 *     "View CV" button
 *   • Visitor Analytics (visitor_tracking)
 *   • Change Credentials (via Topbar dropdown)
 *
 * If a non-authenticated visitor lands here, they are redirected to "/".
 */
export default function Dashboard({ initialData = {}, initialAuthed = false }) {
  const router = useRouter();
  const [data] = useState(initialData);
  const [authed, setAuthed] = useState(initialAuthed);
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
              Manage your downloadable CV PDF and visitor analytics. Public
              visitors cannot see this page.
            </p>
          </div>

          {/* === Downloadable CV (standalone PDF) === */}
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
              This is the standalone PDF shown when a visitor clicks the public{" "}
              <strong>"View CV"</strong> button — it opens in a new browser tab.
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

          {/* === Visitor Analytics === */}
          <AnalyticsCard authed />
        </div>
      </main>

      {toast && <Toast message={toast.msg} isError={toast.isError} />}
    </>
  );
}
