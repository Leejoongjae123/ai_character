export const CameraCorners = () => {
  return (
    <>
      {/* 왼쪽 위 */}
      <div className="absolute top-0 left-0 w-[200px] h-[200px] z-50">
        <div className="absolute top-0 left-0 w-[200px] h-[10px] bg-[#D2B582]"></div>
        <div className="absolute top-0 left-0 w-[10px] h-[200px] bg-[#D2B582]"></div>
      </div>

      {/* 오른쪽 위 */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] z-50">
        <div className="absolute top-0 right-0 w-[200px] h-[10px] bg-[#D2B582]"></div>
        <div className="absolute top-0 right-0 w-[10px] h-[200px] bg-[#D2B582]"></div>
      </div>

      {/* 왼쪽 아래 */}
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] z-50">
        <div className="absolute bottom-0 left-0 w-[200px] h-[10px] bg-[#D2B582]"></div>
        <div className="absolute bottom-0 left-0 w-[10px] h-[200px] bg-[#D2B582]"></div>
      </div>

      {/* 오른쪽 아래 */}
      <div className="absolute bottom-0 right-0 w-[200px] h-[200px] z-50">
        <div className="absolute bottom-0 right-0 w-[200px] h-[10px] bg-[#D2B582]"></div>
        <div className="absolute bottom-0 right-0 w-[10px] h-[200px] bg-[#D2B582]"></div>
      </div>
    </>
  );
}; 