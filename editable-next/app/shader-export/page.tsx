import type { Metadata } from "next";
import ShaderExportClient from "./Client";

export const metadata: Metadata = {
  title: "Shader Export",
  description: "Render the hero shader at 1200x630 and export as PNG.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/shader-export" },
};

export default function ShaderExportPage() {
  return <ShaderExportClient />;
}
