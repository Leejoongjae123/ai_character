'use client'

interface FaceGuideProps {
  className?: string;
}

export function FaceGuide({ className = "" }: FaceGuideProps) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
      <svg
        width="1000"
        height="1000"
        viewBox="0 0 1000 1000"
        className="opacity-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 메인 얼굴 윤곽 */}
        <ellipse
          cx="500"
          cy="450"
          rx="280"
          ry="350"
          stroke="white"
          strokeWidth="6"
          strokeDasharray="15,10"
          fill="none"
          className="drop-shadow-[0_0_20px_rgba(0,0,0,0.7)]"
        />
        
        {/* 왼쪽 귀 */}
        <ellipse
          cx="200"
          cy="420"
          rx="40"
          ry="80"
          stroke="white"
          strokeWidth="4"
          strokeDasharray="8,6"
          fill="none"
          className="drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
        />
        
        {/* 오른쪽 귀 */}
        <ellipse
          cx="800"
          cy="420"
          rx="40"
          ry="80"
          stroke="white"
          strokeWidth="4"
          strokeDasharray="8,6"
          fill="none"
          className="drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
        />
        
        {/* 이마 라인 */}
        <path
          d="M 250 200 Q 500 180 750 200"
          stroke="white"
          strokeWidth="4"
          strokeDasharray="10,8"
          fill="none"
          className="drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
        />
        
        {/* 턱선 */}
        <path
          d="M 250 650 Q 500 780 750 650"
          stroke="white"
          strokeWidth="5"
          strokeDasharray="15,10"
          fill="none"
          className="drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
        />
        
        {/* 광대뼈 힌트 라인 */}
        <path
          d="M 300 380 Q 400 360 500 380 Q 600 360 700 380"
          stroke="white"
          strokeWidth="3"
          strokeDasharray="6,8"
          fill="none"
          opacity="0.6"
          className="drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
        />
        
        {/* 가이드 텍스트 - 메인 */}
        <text
          x="500"
          y="900"
          textAnchor="middle"
          className="fill-white text-2xl font-bold drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'sans-serif' }}
        >
          얼굴을 이 영역에 맞춰주세요
        </text>
        
        {/* 상단 안내 - 이마 */}
        <text
          x="500"
          y="120"
          textAnchor="middle"
          className="fill-white text-xl font-semibold drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'sans-serif' }}
        >
          ↑ 이마가 여기에
        </text>
        
        {/* 하단 안내 - 턱 */}
        <text
          x="500"
          y="850"
          textAnchor="middle"
          className="fill-white text-xl font-semibold drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'sans-serif' }}
        >
          ↓ 턱이 여기에
        </text>
        
        {/* 왼쪽 귀 안내 */}
        <text
          x="200"
          y="350"
          textAnchor="middle"
          className="fill-white text-lg font-medium drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'sans-serif' }}
        >
          귀
        </text>
        
        {/* 오른쪽 귀 안내 */}
        <text
          x="800"
          y="350"
          textAnchor="middle"
          className="fill-white text-lg font-medium drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'sans-serif' }}
        >
          귀
        </text>
        
        {/* 중앙점 표시 */}
        <circle
          cx="500"
          cy="450"
          r="4"
          fill="white"
          opacity="0.8"
          className="drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]"
        />
      </svg>
    </div>
  );
} 