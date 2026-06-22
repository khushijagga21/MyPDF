import type { ToolIconKey } from "@/lib/data/tool-icons";

export type { ToolIconKey };

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: ToolIconKey;
  color: string;
  popular?: boolean;
  available?: boolean;
  category: "organize" | "convert" | "optimize" | "secure";
}

export const tools: Tool[] = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one seamless document",
    href: "/merge-pdf",
    icon: "combine",
    color: "from-violet-500 to-indigo-600",
    popular: true,
    available: true,
    category: "organize",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract pages or divide PDFs into separate files",
    href: "/split-pdf",
    icon: "scissors",
    color: "from-cyan-500 to-blue-600",
    popular: true,
    available: true,
    category: "organize",
  },
  {
    id: "remove-pdf-pages",
    name: "Remove PDF Pages",
    description: "Delete unwanted pages from your PDF document",
    href: "/remove-pdf-pages",
    icon: "file-minus",
    color: "from-red-500 to-rose-600",
    popular: true,
    available: true,
    category: "organize",
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    description: "Reorder, rotate, and remove pages in your PDF",
    href: "/edit-pdf",
    icon: "file-pen",
    color: "from-indigo-500 to-violet-600",
    popular: true,
    available: true,
    category: "organize",
  },
  {
    id: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    description: "Convert PDF pages into an editable PowerPoint deck",
    href: "/pdf-to-powerpoint",
    icon: "presentation",
    color: "from-orange-500 to-red-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract PDF text into a spreadsheet workbook",
    href: "/pdf-to-excel",
    icon: "table",
    color: "from-green-500 to-emerald-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Turn Excel spreadsheets into a polished PDF document",
    href: "/excel-to-pdf",
    icon: "file-spreadsheet",
    color: "from-lime-500 to-green-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Extract PDF text into an editable Word document",
    href: "/pdf-to-word",
    icon: "file-type",
    color: "from-blue-500 to-indigo-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents into a shareable PDF file",
    href: "/word-to-pdf",
    icon: "file-text",
    color: "from-sky-500 to-blue-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce file size while keeping quality intact",
    href: "/compress-pdf",
    icon: "minimize",
    color: "from-emerald-500 to-teal-600",
    popular: true,
    available: true,
    category: "optimize",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Convert every PDF page into high-quality images",
    href: "/pdf-to-jpg",
    icon: "image-down",
    color: "from-amber-500 to-orange-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Turn images into a polished PDF document",
    href: "/jpg-to-pdf",
    icon: "image-up",
    color: "from-rose-500 to-pink-600",
    popular: true,
    available: true,
    category: "convert",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate pages to the perfect orientation",
    href: "/rotate-pdf",
    icon: "rotate",
    color: "from-purple-500 to-violet-600",
    category: "organize",
  },
  {
    id: "watermark-pdf",
    name: "Watermark PDF",
    description: "Add text or image watermarks to your PDFs",
    href: "/watermark-pdf",
    icon: "droplets",
    color: "from-sky-500 to-cyan-600",
    category: "secure",
  },
  {
    id: "unlock-pdf",
    name: "Unlock PDF",
    description: "Remove password protection from PDF files",
    href: "/unlock-pdf",
    icon: "lock-open",
    color: "from-fuchsia-500 to-purple-600",
    category: "secure",
  },
];

export const popularTools = tools.filter((t) => t.popular);
export const availableTools = tools.filter((t) => t.available);

export const toolRoutes = [
  "/merge-pdf",
  "/split-pdf",
  "/remove-pdf-pages",
  "/edit-pdf",
  "/compress-pdf",
  "/jpg-to-pdf",
  "/pdf-to-jpg",
  "/pdf-to-powerpoint",
  "/pdf-to-excel",
  "/excel-to-pdf",
  "/pdf-to-word",
  "/word-to-pdf",
] as const;

export function isToolRoute(pathname: string): boolean {
  return toolRoutes.some((r) => pathname === r || pathname.startsWith(r));
}
