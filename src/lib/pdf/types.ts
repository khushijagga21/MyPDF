export type MergePdfMode = "files" | "pages";

export interface MergePdfFilesRequest {
  mode: "files";
  fileIds: string[];
}

export interface MergePdfPagesRequest {
  mode: "pages";
  pages: Array<{ fileId: string; pageIndex: number }>;
}

export type MergePdfRequest = MergePdfFilesRequest | MergePdfPagesRequest;

export interface MergePdfErrorResponse {
  error: string;
}

export type SplitPdfMode = "range" | "every" | "individual";

export interface SplitPdfRangeRequest {
  mode: "range";
  fileId: string;
  from: number;
  to: number;
  baseName?: string;
}

export interface SplitPdfEveryRequest {
  mode: "every";
  fileId: string;
  every: number;
  baseName?: string;
}

export interface SplitPdfIndividualRequest {
  mode: "individual";
  fileId: string;
  /** 1-indexed page numbers; omit to split all pages */
  pages?: number[];
  baseName?: string;
}

export type SplitPdfRequest =
  | SplitPdfRangeRequest
  | SplitPdfEveryRequest
  | SplitPdfIndividualRequest;

export interface SplitPdfErrorResponse {
  error: string;
}

export interface RemovePdfPagesRequest {
  fileId: string;
  /** 1-indexed page numbers to remove */
  removePages: number[];
  baseName?: string;
}

export interface RemovePdfPagesErrorResponse {
  error: string;
}

export interface EditPdfPageInput {
  pageIndex: number;
  rotation: number;
}

export interface EditPdfRequest {
  fileId: string;
  pages: EditPdfPageInput[];
  baseName?: string;
}

export type SplitPdfFilePayload =
  | Omit<SplitPdfRangeRequest, "fileId">
  | Omit<SplitPdfEveryRequest, "fileId">
  | Omit<SplitPdfIndividualRequest, "fileId">;

export type RemovePdfPagesFilePayload = Omit<RemovePdfPagesRequest, "fileId">;
export type EditPdfFilePayload = Omit<EditPdfRequest, "fileId">;

export interface PdfToPowerpointRequest {
  images: string[];
  baseName?: string;
}
