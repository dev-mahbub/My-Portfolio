import "./globals.css";

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
