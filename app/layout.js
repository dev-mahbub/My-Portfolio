import "./globals.css";
import "./styles/common.css";
import "./styles/topbar.css";
import "./styles/profile.css";
import "./styles/skills.css";
import "./styles/projects.css";
import "./styles/timeline.css";
import "./styles/forms.css";
import "./styles/modal.css";
import "./styles/dashboard.css";

export const metadata = {
  title: "Portfolio — LinkedIn Style",
  description: "A full-stack editable LinkedIn-style portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
