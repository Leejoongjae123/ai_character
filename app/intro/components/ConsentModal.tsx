"use client";

import { useState } from "react";
import { ConsentModalProps, ConsentState } from "../types";

export default function ConsentModal({ isOpen, onOpenChange, onConsent }: ConsentModalProps) {
  const [consent, setConsent] = useState<ConsentState>({
    agreed: false,
  });

  const handleConsentChange = (checked: boolean) => {
    setConsent({ agreed: checked });
  };

  const handleProceed = () => {
    if (consent.agreed) {
      onConsent();
      onOpenChange(false);
    }
  };

  const resetConsent = () => {
    setConsent({
      agreed: false,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetConsent();
          onOpenChange(false);
        }
      }}
    >
      <div className="px-[5%] w-[1620px] h-[85vh] overflow-y-auto bg-[#F5F1E8] border-4 border-[#471F0D] rounded-[30px] p-6 flex flex-col justify-center">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center space-y-5">
            <h1 
              className="font-bold text-[#471F0D] mb-1"
              style={{ fontFamily: "MuseumClassic, serif", fontSize: "70px" }}
            >
              AI 수군 변신소 체험을 위한 개인정보<br />
              수집•이용 및 초상권 활용 동의서
            </h1>
            <div className="text-[#471F0D] font-semibold" style={{ fontSize: "50px" }}>
              2025 문화도시 울산 조성 [구군특화사업] 지원 사업
            </div>
            <div className="text-[#471F0D] leading-tight my-5" style={{ fontSize: "50px" }}>
              본 체험은 울산문화관광재단이 주최하고,<br />
              2025 문화도시 울산 조성 [구군특화사업]의 지원을 받아 운영됩니다.
            </div>
          </div>

          <div className="space-y-15 my-3">
          <div className="text-[#471F0D] leading-tight bg-white/50 p-3 rounded-[15px] border border-[#471F0D] p-10" style={{ fontSize: "48px" }}>
            귀하의 얼굴 이미지는 AI 기술을 이용하여 조선 수군 캐릭터와 합성된 이미지를 생성하고, 포토카드 출력 및 전시에 활용됩니다. 
            생성된 이미지 및 AI 분석 프롬프트는 체험 콘텐츠의 개선 및 정량•정성적 통계 분석을 위해 최대 3년간 보관됩니다.
          </div>

          {/* 개인정보 수집•활용 항목 및 목적 */}
          <div className="border-2 border-[#471F0D] rounded-[20px] p-3 bg-white/50 p-10">
            <h3 className="font-bold text-[#471F0D] mb-2" style={{ fontSize: "48px" }}>■ 개인정보 수집•활용 항목 및 목적</h3>
            <div className="space-y-1 text-[#471F0D]" style={{ fontSize: "40px" }}>
              <div>
                <strong>수집 항목</strong><br />
                · 얼굴 이미지, 합성된 캐릭터 이미지, AI 분석 프롬프트 텍스트
              </div>
              <div>
                <strong>수집 목적</strong><br />
                · AI 기반 캐릭터 생성 및 체험 서비스 제공<br />
                · 포토카드 등 결과물 출력<br />
                · 전시, 홍보, 보도자료 등 2차 활용<br />
                · 체험 통계 데이터 분석 및 서비스 개선
              </div>
              <div>
                <strong>보관 기간:</strong> 체험일로부터 최대 3년 보관 후 안전하게 폐기<br />
                <strong>제3자 제공:</strong> 없음<br />
                <strong>활용 범위:</strong> 전시, 홍보 콘텐츠, 학술/연구 목적의 통계 자료 (단, 실명•연락처 등 민감정보 제외)
              </div>
            </div>
          </div>

          {/* 이용자의 권리 */}
          <div className="border-2 border-[#471F0D] rounded-[20px] p-3 bg-white/50 p-10">
            <h3 className="font-bold text-[#471F0D] mb-2" style={{ fontSize: "48px" }}>■ 이용자의 권리</h3>
            <div className="space-y-1 text-[#471F0D]" style={{ fontSize: "40px" }}>
              <p>귀하는 언제든지 본인의 정보에 대해 열람, 정정, 삭제를 요청할 수 있습니다.</p>
              <p>본 동의는 체험 제공을 위한 필수 동의사항입니다.</p>
              <p className="font-semibold">※ 동의하지 않으실 경우 체험 및 결과물 출력이 제한됩니다.</p>
            </div>
          </div>

          {/* 개인정보 보호책임자 */}
          <div className="border-2 border-[#471F0D] rounded-[20px] p-3 bg-white/50 p-10">
            <div className="text-[#471F0D] space-y-1" style={{ fontSize: "40px" }}>
              <p><strong>개인정보 보호책임자:</strong></p>
              <p>운영기관: 비모어(BEMORE)</p>
              <p>담당자: 이보미 / 연락처: 052-911-1015</p>
              <p>이메일: bemoreartwork@gmail.com</p>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <div className="border-3 border-[#471F0D] rounded-[20px] p-3 bg-[#E4BE50]/20 p-10">
            <div className="flex items-center space-x-3 gap-x-5">
              <input
                type="checkbox"
                id="consent"
                checked={consent.agreed}
                onChange={(e) => handleConsentChange(e.target.checked)}
                className="mt-1 w-12 h-12 accent-[#471F0D] cursor-pointer"
              />
              <div className="flex-1">
                <label 
                  htmlFor="consent" 
                  className="font-bold text-[#471F0D] cursor-pointer"
                  style={{ fontSize: "48px" }}
                >
                  위 내용을 충분히 읽고 이해하였으며, 얼굴 촬영, AI 분석, 출력, 저장, 전시 및 통계 활용에 동의합니다.
                </label>
              </div>
            </div>
          </div>

            <div className="text-[#471F0D] text-center mt-2" style={{ fontSize: "44px" }}>
              ※ 만 14세 미만의 아동은 보호자(법정대리인)의 서면 동의가 필요합니다.
            </div>
          </div>

          <div className="flex justify-center items-center w-full pt-3 mt-10">
            <div className="flex justify-center w-full">
              <button
                onClick={handleProceed}
                disabled={!consent.agreed}
                className={`px-8 py-3 font-bold rounded-[20px] transition-all border-4 ${
                  consent.agreed 
                    ? 'bg-[#E4BE50] text-[#471F0D] hover:bg-[#D4AE40] border-[#471F0D] shadow-lg cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                }`}
                style={{ fontSize: "60px" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}