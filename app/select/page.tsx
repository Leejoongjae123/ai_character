import Image from "next/image";
import { RoleSelection } from "./components/RoleSelection";
import { Character } from "./types";
import { createClient } from "@/utils/supabase/server";

async function getCharacters() {
  try {
    const supabase = await createClient();
    
    const { data: characters, error } = await supabase
      .from('character')
      .select('*')
      .order('"order"', { ascending: true });

    if (error) {
      return [];
    }

    return characters as Character[];
  } catch (error) {
    return [];
  }
}

export default async function SelectPage() {
  const characters = await getCharacters();

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center ">
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />
      

      <div className="flex flex-col items-center justify-center z-30 mt-[300px] mb-[50px] leading-[1.2] animate-fade-in">
        <div
          className="text-[#481F0E] text-[238px] font-bold text-center mb-4"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          역할 선택하기
        </div>
        <div
          className="text-[#471F0D] text-[80px] font-bold text-center tracking-[-0.06em]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          한 번의 터치로, 당신은 조선의 수군이 됩니다.
        </div>
      </div>

      {/* 동적 역할 선택 컴포넌트 */}
      <RoleSelection characters={characters} />
    </div>
  );
}


