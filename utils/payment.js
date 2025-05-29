'use client';

import { loadTossPayments, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";

// 토스페이먼츠 클라이언트 키 (실제 구현 시에는 환경 변수로 관리해야 함)
// const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const clientKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_API_KEY;
// 결제 인스턴스를 저장할 변수
let paymentInstance = null;

/**
 * 유효한 customerKey 생성
 * 영문 대소문자, 숫자, 특수문자(-_=.@)로 구성된 2~50자의 문자열
 */
function generateValidCustomerKey() {
  // 알파벳과 숫자로 구성된 20자리 문자열 생성
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.=@';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return `user_${result}`;
}

/**
 * 결제 인스턴스 가져오기 (싱글톤 패턴)
 */
export async function getPaymentInstance() {
  if (paymentInstance) {
    return paymentInstance;
  }
  
  try {
    // 토스페이먼츠 SDK 로드
    const tossPayments = await loadTossPayments(clientKey);
    
    // 회원 결제 (식별 가능한 고객의 경우)
    // const customerKey = generateValidCustomerKey();
    // const payment = tossPayments.payment({ customerKey });
    
    // 비회원 결제
    const payment = tossPayments.payment({ customerKey: ANONYMOUS });
    
    paymentInstance = payment;
    return payment;
  } catch (error) {
    console.error('토스페이먼츠 로드 오류:', error);
    throw error;
  }
}

/**
 * 결제 진행하기
 * @param {number} amount - 결제 금액
 * @param {string} orderName - 주문명
 */
export async function requestPayment({ amount, orderName }) {
  try {
    const payment = await getPaymentInstance();
    
    // 주문번호 생성 (고유값으로 생성)
    const orderId = nanoid();
    
    // 결제 요청
    await payment.requestPayment({
      method: "CARD",  // 결제 수단 (카드)
      amount: {
        currency: "KRW",
        value: amount
      },
      orderId: orderId, // 주문 ID (고유값이어야 함)
      orderName: orderName, // 주문명
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
      flowMode: 'DEFAULT', // 기본 결제창 모드
      card: {
        useCardPoint: false, // 카드 포인트 사용 여부
        useInstallment: false, // 할부 사용 여부
        useDirectCard: false, // 다이렉트 카드 결제 여부
      }
    });
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    throw error;
  }
} 