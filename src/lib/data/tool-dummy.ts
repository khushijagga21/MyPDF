export interface DummyPage {
  id: string;
  pageNumber: number;
  label?: string;
  thumbnail?: string;
}

export const dummyPdfPages: DummyPage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `page-${i + 1}`,
  pageNumber: i + 1,
}));

export const compressionEstimates: Record<string, number> = {
  low: 0.8,
  medium: 0.5,
  high: 0.2,
};

export const splitOptions = [
  {
    id: "range",
    title: "Extract page range",
    description: "Pull out a specific range of pages into a new PDF",
    example: "e.g. pages 3–7",
  },
  {
    id: "every",
    title: "Split every N pages",
    description: "Divide the document into equal chunks automatically",
    example: "e.g. every 5 pages",
  },
  {
    id: "individual",
    title: "Split into individual pages",
    description: "Create a separate PDF for each page",
    example: "8 pages → 8 files",
  },
] as const;

export const pageSizeOptions = [
  { id: "a4", label: "A4", dimensions: "210 × 297 mm" },
  { id: "letter", label: "Letter", dimensions: "8.5 × 11 in" },
  { id: "fit", label: "Fit to image", dimensions: "Auto-sized" },
] as const;

export const imageQualityOptions = [
  { id: "standard", label: "Standard", dpi: "150 DPI", description: "Good for web sharing" },
  { id: "high", label: "High", dpi: "300 DPI", description: "Best for printing" },
] as const;

export const outputFormatOptions = [
  { id: "jpg", label: "JPG" },
  { id: "png", label: "PNG" },
] as const;
