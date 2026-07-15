/**
 * Professional monochrome SVG icons (stroke-based, like Feather/Lucide).
 * Usage: <Icon.Home size={18} />  or  import { Home } from "@/components/Icons"
 */
const Icon = ({ size = 20, className = "", children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`svg-icon ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

export const Home = (p) => (
  <Icon {...p}>
    <path d="M3 9.5L12 3l9 6.5" />
    <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    <path d="M9 21v-6h6v6" />
  </Icon>
);
export const User = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </Icon>
);
export const Briefcase = (p) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </Icon>
);
export const Brain = (p) => (
  <Icon {...p}>
    <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0V3z" />
    <path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0" />
  </Icon>
);
export const Mail = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Icon>
);
export const Search = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);
export const ChevronDown = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);
export const MapPin = (p) => (
  <Icon {...p}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
export const FileText = (p) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </Icon>
);
export const Phone = (p) => (
  <Icon {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
  </Icon>
);
export const Linkedin = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 10v7" />
    <circle cx="8" cy="7" r="1" />
    <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
    <path d="M12 13v4" />
  </Icon>
);
export const Github = (p) => (
  <Icon {...p}>
    <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6 3.3 5 3.6 5 3.6a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.6 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22" />
  </Icon>
);
export const Star = (p) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 17l-5.4 2.6 1-6L3.3 9.4l6-.9z" />
  </Icon>
);
export const Award = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
  </Icon>
);
export const Edit = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);
export const X = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Icon>
);
export const Plus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);
export const ChevronUp = (p) => (
  <Icon {...p}>
    <path d="M18 15l-6-6-6 6" />
  </Icon>
);
export const ChevronRight = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const Download = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </Icon>
);
export const Upload = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </Icon>
);
export const Send = (p) => (
  <Icon {...p}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </Icon>
);
export const Globe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
  </Icon>
);
export const Lock = (p) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
export const LogOut = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);
export const Check = (p) => (
  <Icon {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);
export const Image = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Icon>
);

const all = {
  Home,
  User,
  Briefcase,
  Brain,
  Mail,
  Search,
  ChevronDown,
  MapPin,
  FileText,
  Phone,
  Linkedin,
  Github,
  Star,
  Award,
  Edit,
  X,
  Plus,
  ChevronUp,
  ChevronRight,
  Download,
  Upload,
  Send,
  Globe,
  Lock,
  LogOut,
  Check,
  Image,
};

export default all;
