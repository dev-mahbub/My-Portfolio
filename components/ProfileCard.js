import Icon from "@/components/Icons";

/**
 * ProfileCard
 *
 * "View CV" button opens the public-viewable CV (PDF) in a new browser tab.
 * It streams the PDF inline via /api/cv/view so the browser's built-in
 * PDF viewer renders it. This is completely independent of the editable
 * online CV text (dashboard_content.cv_text).
 */
export default function ProfileCard({ profile, authed, onContact, onEdit }) {
  const stats = profile?.stats || {};

  const handleViewCv = () => {
    window.open("/api/cv/view", "_blank", "noopener,noreferrer");
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
            onClick={handleViewCv}
            title="View CV (opens in a new tab)"
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
