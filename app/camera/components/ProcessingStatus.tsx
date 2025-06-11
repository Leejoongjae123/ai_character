interface ProcessingStatusProps {
  isUploading: boolean;
  showLottieLoader: boolean;
  processingMessage: string;
}

export const ProcessingStatus = ({ 
  isUploading, 
  showLottieLoader, 
  processingMessage 
}: ProcessingStatusProps) => {
  if (isUploading && !showLottieLoader) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="text-[80px] font-bold text-white px-8 py-4 rounded-lg text-[#481F0E]">
          저장 중...
        </div>
      </div>
    );
  }

  return null;
}; 