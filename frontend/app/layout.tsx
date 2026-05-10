import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Background3D } from "@/components/ui/Background3D";
import { NavBar } from "@/components/ui/NavBar";

export const metadata: Metadata = {
  title: "Ijazah Blockchain - Universitas Subang",
  description: "Sistem Verifikasi Ijazah Digital Berbasis Blockchain Universitas Subang",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#0a0a1a] text-white antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
        <Background3D />
        <NavBar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
