import "./globals.css";

export const metadata = {
  title: "LMS Scaffold",
  description: "Phase 0 scaffold for the LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
