
export interface VideoFile {
  id?: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  videoUrl: string;
  uploadedAt?: Date;
}
