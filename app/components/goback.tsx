'use client'
import { useRouter } from "next/navigation";
import { MdOutlineArrowBack } from "react-icons/md";
import {usePathname} from "next/navigation"

export default function GoBack() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 루트 경로일 때는 컴포넌트를 렌더링하지 않음
  if (pathname === '/') {
    return null;
  }
  
  return (
    <div className="absolute top-[2vh] left-[2vh]  z-50 text-[100px] gap-x-5 flex flex-row items-center" onClick={() => router.back()}>
      <MdOutlineArrowBack  className="text-[#471F0D] font-bold text-[150px]"/>
      {/* <span className="text-[#471F0D] font-bold text-[100px]">뒤로가기</span>     */}
    </div>
  );
}
