import {
  Combine,
  Scissors,
  Minimize2,
  ImageDown,
  ImageUp,
  RotateCw,
  Droplets,
  LockOpen,
  FileMinus,
  FilePen,
  Presentation,
  FileSpreadsheet,
  Table2,
  FileText,
  FileType2,
  type LucideIcon,
} from "lucide-react";

export const toolIcons = {
  combine: Combine,
  scissors: Scissors,
  minimize: Minimize2,
  "image-down": ImageDown,
  "image-up": ImageUp,
  rotate: RotateCw,
  droplets: Droplets,
  "lock-open": LockOpen,
  "file-minus": FileMinus,
  "file-pen": FilePen,
  presentation: Presentation,
  "file-spreadsheet": FileSpreadsheet,
  table: Table2,
  "file-text": FileText,
  "file-type": FileType2,
} as const;

export type ToolIconKey = keyof typeof toolIcons;

export function getToolIcon(key: ToolIconKey): LucideIcon {
  return toolIcons[key];
}
