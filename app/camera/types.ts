export interface PageProps {
  searchParams: Promise<{ character?: string }>;
}

export interface CameraPageContentProps {
  searchParams: Promise<{ character?: string }>;
}

export interface CameraClientProps {
  characterId?: string;
}

export interface WebcamComponentProps {
  onVideoRef: (ref: HTMLVideoElement | null) => void;
}

export interface FaceSwapResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

export interface JobStatusResponse {
  success: boolean;
  job_id: string;
  status: 'processing' | 'completed';
  message: string;
  image_url?: string;
  error?: string;
} 