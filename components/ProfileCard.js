import Icon from "@/components/Icons";

/**
 * ProfileCard
 *
 * "Download CV" button serves the STANDALONE downloadable PDF
 * (public_files via /api/cv/download) — completely independent of the
 * editable online CV text (dashboard_content.cv_text).
 */
export default function ProfileCard({ profile, authed, onContact, onEdit }) {
  const stats = profile?.stats || {};

  const handleDownloadCv = async () => {
    try {
      const res = await fetch("/api/cv/download");
      if (!res.ok) throw new Error("Download failed");
      const json = await res.json();
      if (json.source === "uploaded" && json.url) {
        // serve the uploaded standalone PDF
        window.open(json.url, "_blank", "noopener,noreferrer");
      } else if (json.source === "generated" && json.base64) {
        // on-the-fly ATS-friendly PDF
        const bin = atob(json.base64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const blob = new Blob([arr], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = json.filename || "CV.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        throw new Error("No CV available");
      }
    } catch (e) {
      alert("Could not download CV: " + e.message);
    }
  };

  return (
    <section className="card profile-card" id="home">
      <div
        className="cover"
        style={
          profile?.cover
            ? { backgroundImage: `url(${profile.cover})` }
            : undefined
        }
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={profile?.avatar} alt={profile?.name} className="avatar" />

      <div className="profile-info">
        <h1>{profile?.name}</h1>
        <p className="headline">{profile?.headline}</p>
        <p className="location">
          <Icon.MapPin size={14} className="inline-ico" />
          {profile?.location}
          &nbsp;·&nbsp;
          <a href="#contact">Contact info</a>
        </p>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleDownloadCv}
            title="View / download CV (PDF)"
          >
            <Icon.FileText size={18} /> View CV
          </button>
          <button className="btn btn-outline" onClick={onContact}>
            <Icon.Mail size={18} /> Contact Me
          </button>
          {authed && (
            <button className="btn btn-ghost" onClick={onEdit}>
              <Icon.Edit size={16} /> Edit profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <strong>{stats.connections ?? 0}</strong>
          <span>Connections</span>
        </div>
        <div className="stat">
          <strong>{stats.experience ?? "0"}</strong>
          <span>Years Exp</span>
        </div>
        <div className="stat">
          <strong>{stats.projects ?? "0"}</strong>
          <span>Projects</span>
        </div>
      </div>
    </section>
  );
}
