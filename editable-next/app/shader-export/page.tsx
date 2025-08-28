import { notFound } from "next/navigation";

// This temporary tool page has been removed intentionally.
// Keep the route to avoid broken imports, but return 404.
export default function ShaderExportPage() {
  notFound();
}
