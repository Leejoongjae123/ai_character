import { FaceSwapResponse, JobStatusResponse } from "@/app/camera/types";

export const requestFaceSwap = async (
  faceImageUrl: string,
  characterId: string
): Promise<FaceSwapResponse> => {
  try {
    const response = await fetch('/api/face-swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        faceImageUrl,
        characterId,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: '얼굴 스왑 요청 중 오류가 발생했습니다.',
    };
  }
};

export const checkJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  try {
    const response = await fetch(`/api/job-status/${jobId}`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      job_id: jobId,
      status: 'processing',
      message: '작업 상태 확인 중 오류가 발생했습니다.',
      error: '작업 상태 확인 실패',
    };
  }
};

export const pollJobStatus = async (
  jobId: string,
  onProgress?: (status: JobStatusResponse) => void,
  maxAttempts: number = 60, // 최대 5분 (5초 간격)
  interval: number = 5000 // 5초 간격
): Promise<JobStatusResponse> => {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        reject(new Error('작업 시간이 초과되었습니다.'));
        return;
      }

      try {
        const status = await checkJobStatus(jobId);
        
        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed' && status.image_url) {
          resolve(status);
          return;
        } else if (!status.success && status.error) {
          reject(new Error(status.error));
          return;
        }

        // 아직 처리 중이면 다시 폴링
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}; 