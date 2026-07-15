"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icons";

const SECTION_TITLES = {
  profile: "Edit Profile",
  skills: "Edit Skills",
  projects: "Edit Projects",
  highlights: "Edit Highlights",
  contact: "Edit Contact",
  languages: "Edit Languages",
  cv_text: "Edit Online CV Text",
  cover_letter: "Edit Cover Letter",
};

export default function EditPanel({
  section,
  data,
  onClose,
  onSave,
  onUpload,
}) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.className === "modal-overlay" && onClose()}
    >
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="card-head" style={{ marginBottom: "0.75rem" }}>
          <h2>
            <span className="badge-edit">Editing</span>{" "}
            {SECTION_TITLES[section]}
          </h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <Icon.X size={18} />
          </button>
        </div>

        {section === "profile" && (
          <ProfileEditor
            data={data.profile}
            onSave={onSave}
            onUpload={onUpload}
          />
        )}
        {section === "skills" && (
          <SkillsEditor data={data.skills} onSave={onSave} />
        )}
        {section === "projects" && (
          <ProjectsEditor
            data={data.projects}
            onSave={onSave}
            onUpload={onUpload}
          />
        )}
        {section === "highlights" && (
          <ListEditor
            data={data.highlights}
            onSave={onSave}
            section="highlights"
          />
        )}
        {section === "languages" && (
          <LanguagesEditor data={data.languages} onSave={onSave} />
        )}
        {section === "contact" && (
          <ContactEditor data={data.contact} onSave={onSave} />
        )}
        {section === "cv_text" && (
          <TextEditor
            title="Online CV Text"
            description="This is the editable online CV shown on the public page. It does NOT affect the downloadable PDF."
            data={data.cv_text}
            onSave={onSave}
            section="cv_text"
          />
        )}
        {section === "cover_letter" && (
          <TextEditor
            title="Cover Letter"
            description="Global-standard cover letter template. Use placeholders like [Company Name] and [Job Title]."
            data={data.cover_letter}
            onSave={onSave}
            section="cover_letter"
          />
        )}
      </div>
    </div>
  );
}

/* ============ GENERIC TEXT EDITOR (cv_text / cover_letter) ============ */
function TextEditor({ data = "", onSave, section, description }) {
  const [value, setValue] = useState(data);
  useEffect(() => setValue(data), [data]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(section, value);
      }}
    >
      {description && (
        <p
          className="muted"
          style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
        >
          {description}
        </p>
      )}
      <div className="field">
        <textarea
          className="textarea"
          style={{ minHeight: 280, fontFamily: "monospace" }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setValue(data)}
        >
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ============ PROFILE EDITOR ============ */
function ProfileEditor({ data = {}, onSave, onUpload }) {
  const [form, setForm] = useState(data);
  const [busy, setBusy] = useState(null);

  useEffect(() => setForm(data), [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStat = (k, v) =>
    setForm((f) => ({ ...f, stats: { ...(f.stats || {}), [k]: v } }));

  const upload = async (file, type, key) => {
    setBusy(key);
    const url = await onUpload(file, type);
    setBusy(null);
    if (url) set(key, url);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave("profile", form);
      }}
    >
      <div className="field">
        <label>Name</label>
        <input
          className="input"
          value={form.name || ""}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Headline / Subtitle</label>
        <input
          className="input"
          value={form.headline || ""}
          onChange={(e) => set("headline", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Location</label>
        <input
          className="input"
          value={form.location || ""}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>
      <div className="field">
        <label>About (main)</label>
        <textarea
          className="textarea"
          value={form.about || ""}
          onChange={(e) => set("about", e.target.value)}
        />
      </div>
      <div className="field">
        <label>About (extra — shown on "read more")</label>
        <textarea
          className="textarea"
          value={form.aboutExtra || ""}
          onChange={(e) => set("aboutExtra", e.target.value)}
        />
      </div>

      <div className="row-gap">
        <div className="field" style={{ flex: 1 }}>
          <label>Connections</label>
          <input
            className="input"
            value={form.stats?.connections ?? ""}
            onChange={(e) => setStat("connections", e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Years Exp</label>
          <input
            className="input"
            value={form.stats?.experience ?? ""}
            onChange={(e) => setStat("experience", e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Projects count</label>
          <input
            className="input"
            value={form.stats?.projects ?? ""}
            onChange={(e) => setStat("projects", e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Avatar URL or upload</label>
        <input
          className="input"
          value={form.avatar || ""}
          onChange={(e) => set("avatar", e.target.value)}
          placeholder="https://..."
        />
        <label className="upload-box" style={{ marginTop: "0.4rem" }}>
          {busy === "avatar" ? (
            "Uploading..."
          ) : (
            <>
              <Icon.Upload size={16} /> Upload avatar
            </>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files[0] && upload(e.target.files[0], "avatar", "avatar")
            }
          />
        </label>
      </div>

      <div className="field">
        <label>Cover URL or upload</label>
        <input
          className="input"
          value={form.cover || ""}
          onChange={(e) => set("cover", e.target.value)}
          placeholder="https://..."
        />
        <label className="upload-box" style={{ marginTop: "0.4rem" }}>
          {busy === "cover" ? (
            "Uploading..."
          ) : (
            <>
              <Icon.Upload size={16} /> Upload cover
            </>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files[0] && upload(e.target.files[0], "cover", "cover")
            }
          />
        </label>
      </div>

      <div className="field">
        <label>CV (PDF) — drop your updated CV</label>
        {form.cvFile && (
          <div className="upload-preview">
            Current:{" "}
            <a href={form.cvFile} target="_blank" rel="noreferrer">
              {form.cvFile}
            </a>
          </div>
        )}
        <label className="upload-box">
          {busy === "cvFile" ? (
            "Uploading..."
          ) : (
            <>
              <Icon.FileText size={16} /> Drop/choose CV (PDF)
            </>
          )}
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={async (e) => {
              if (e.target.files[0]) {
                const url = await upload(e.target.files[0], "cv", "cvFile");
              }
            }}
          />
        </label>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setForm(data)}
        >
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          Save profile
        </button>
      </div>
    </form>
  );
}

/* ============ SKILLS EDITOR ============ */
function SkillsEditor({ data = [], onSave }) {
  const [items, setItems] = useState(data);

  const update = (id, key, val) =>
    setItems((arr) => arr.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  const add = () =>
    setItems((arr) => [
      ...arr,
      {
        id: "sk" + Date.now(),
        name: "New skill",
        level: 50,
        desc: "",
        projects: [],
      },
    ]);
  const remove = (id) => setItems((arr) => arr.filter((s) => s.id !== id));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave("skills", items);
      }}
    >
      {items.map((s) => (
        <div
          key={s.id}
          className="edit-row"
          style={{
            alignItems: "flex-start",
            borderBottom: "1px solid var(--li-border)",
            paddingBottom: "0.5rem",
          }}
        >
          <input
            className="input"
            value={s.name}
            onChange={(e) => update(s.id, "name", e.target.value)}
            placeholder="Skill name"
            style={{ flex: 2 }}
          />
          <input
            className="input"
            type="number"
            min="0"
            max="100"
            value={s.level}
            onChange={(e) => update(s.id, "level", Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => remove(s.id)}
          >
            ✕
          </button>
          <input
            className="input"
            value={s.desc}
            onChange={(e) => update(s.id, "desc", e.target.value)}
            placeholder="Description"
            style={{ flexBasis: "100%" }}
          />
          <input
            className="input"
            value={(s.projects || []).join(", ")}
            onChange={(e) =>
              update(
                s.id,
                "projects",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Related projects (comma separated)"
            style={{ flexBasis: "100%" }}
          />
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>
        + Add skill
      </button>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save skills
        </button>
      </div>
    </form>
  );
}

/* ============ PROJECTS EDITOR ============ */
function ProjectsEditor({ data = [], onSave, onUpload }) {
  const [items, setItems] = useState(data);
  const [busy, setBusy] = useState(null);

  const update = (id, key, val) =>
    setItems((arr) => arr.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const add = () =>
    setItems((arr) => [
      ...arr,
      {
        id: "pr" + Date.now(),
        title: "New Project",
        icon: "💼",
        meta: "",
        short: "",
        long: "",
        tech: [],
        cover: "",
      },
    ]);
  const remove = (id) => setItems((arr) => arr.filter((p) => p.id !== id));

  const uploadCover = async (id, file) => {
    setBusy(id);
    const url = await onUpload(file, "cover");
    setBusy(null);
    if (url) update(id, "cover", url);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave("projects", items);
      }}
    >
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            borderBottom: "1px solid var(--li-border)",
            paddingBottom: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <div className="edit-row">
            <input
              className="input"
              value={p.icon || ""}
              onChange={(e) => update(p.id, "icon", e.target.value)}
              placeholder="Icon (emoji)"
              style={{ flexBasis: "60px" }}
            />
            <input
              className="input"
              value={p.title}
              onChange={(e) => update(p.id, "title", e.target.value)}
              placeholder="Title"
              style={{ flex: 2 }}
            />
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => remove(p.id)}
            >
              ✕
            </button>
          </div>
          <div className="field">
            <label>Meta (role · year)</label>
            <input
              className="input"
              value={p.meta || ""}
              onChange={(e) => update(p.id, "meta", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Short description</label>
            <input
              className="input"
              value={p.short || ""}
              onChange={(e) => update(p.id, "short", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Long description (details)</label>
            <textarea
              className="textarea"
              value={p.long || ""}
              onChange={(e) => update(p.id, "long", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Tech stack (comma separated)</label>
            <input
              className="input"
              value={(p.tech || []).join(", ")}
              onChange={(e) =>
                update(
                  p.id,
                  "tech",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div className="field">
            <label>Cover photo URL or upload</label>
            <input
              className="input"
              value={p.cover || ""}
              onChange={(e) => update(p.id, "cover", e.target.value)}
              placeholder="https://..."
            />
            <label className="upload-box" style={{ marginTop: "0.4rem" }}>
              {busy === p.id ? (
                "Uploading..."
              ) : (
                <>
                  <Icon.Image size={16} /> Upload cover photo
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files[0] && uploadCover(p.id, e.target.files[0])
                }
              />
            </label>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>
        + Add project
      </button>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save projects
        </button>
      </div>
    </form>
  );
}

/* ============ GENERIC LIST EDITOR (highlights) ============ */
function ListEditor({ data = [], onSave, section }) {
  const [items, setItems] = useState(data.map((x) => ({ text: x })));

  const update = (i, v) =>
    setItems((arr) => arr.map((x, idx) => (idx === i ? { text: v } : x)));
  const add = () => setItems((arr) => [...arr, { text: "" }]);
  const remove = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(section, items.map((x) => x.text).filter(Boolean));
      }}
    >
      {items.map((x, i) => (
        <div key={i} className="edit-row">
          <input
            className="input"
            value={x.text}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => remove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>
        + Add item
      </button>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ============ LANGUAGES EDITOR ============ */
function LanguagesEditor({ data = [], onSave }) {
  const [items, setItems] = useState(data);

  const update = (i, key, v) =>
    setItems((arr) =>
      arr.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)),
    );
  const add = () => setItems((arr) => [...arr, { name: "", level: "" }]);
  const remove = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave("languages", items);
      }}
    >
      {items.map((x, i) => (
        <div key={i} className="edit-row">
          <input
            className="input"
            value={x.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Language"
          />
          <input
            className="input"
            value={x.level}
            onChange={(e) => update(i, "level", e.target.value)}
            placeholder="Level"
          />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => remove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>
        + Add language
      </button>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save languages
        </button>
      </div>
    </form>
  );
}

/* ============ CONTACT EDITOR ============ */
function ContactEditor({ data = {}, onSave }) {
  const [form, setForm] = useState(data);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave("contact", form);
      }}
    >
      <div className="field">
        <label>Email</label>
        <input
          className="input"
          value={form.email || ""}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Phone</label>
        <input
          className="input"
          value={form.phone || ""}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <div className="field">
        <label>LinkedIn URL</label>
        <input
          className="input"
          value={form.linkedin || ""}
          onChange={(e) => set("linkedin", e.target.value)}
        />
      </div>
      <div className="field">
        <label>GitHub URL</label>
        <input
          className="input"
          value={form.github || ""}
          onChange={(e) => set("github", e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save contact
        </button>
      </div>
    </form>
  );
}
