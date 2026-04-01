/**
 * Image Entity - represents an uploaded image
 */
export interface Image {
  id: string;
  filename: string;
  originalName: string;
  url?: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  uploadedBy?: string;
}
