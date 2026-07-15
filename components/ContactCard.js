import Icon from "@/components/Icons";

export default function ContactCard({ contact = {}, authed, onEdit }) {
  return (
    <section className="card" id="contact">
      <div className="card-head">
        <h2>
          <Icon.Mail size={18} className="inline-ico" /> Contact
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
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
        {!contact.email &&
          !contact.phone &&
          !contact.linkedin &&
          !contact.github && <li className="muted">No contact info yet.</li>}
      </ul>
    </section>
  );
}
