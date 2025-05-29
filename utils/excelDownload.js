import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * 갤러리 데이터를 엑셀 파일로 변환하여 다운로드합니다.
 * @param {Array} data - 엑셀로 변환할 데이터 배열
 * @param {string} fileName - 저장할 파일 이름 (확장자 없이)
 */
export const downloadExcel = (data, fileName = '갤러리_데이터') => {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    console.error('다운로드할 데이터가 없습니다.');
    return;
  }

  try {
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '갤러리 정보');
    
    // 엑셀 파일로 변환
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Blob 객체 생성
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // 파일 저장
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

    console.log('엑셀 파일 다운로드 완료');
  } catch (error) {
    console.error('엑셀 파일 생성 중 오류 발생:', error);
  }
};

/**
 * Supabase에서 모든 갤러리 정보를 가져와 엑셀로 다운로드합니다.
 * @param {Object} supabase - Supabase 클라이언트 객체
 * @param {string} fileName - 저장할 파일 이름 (확장자 없이)
 */
export const fetchAndDownloadGalleryData = async (supabase, fileName = '갤러리_데이터') => {
  try {
    // 갤러리 데이터 가져오기
    const { data, error } = await supabase
      .from('gallery')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('다운로드할 갤러리 데이터가 없습니다.');
      return;
    }
    
    // 엑셀 다운로드 실행
    downloadExcel(data, fileName);
    
    return { success: true };
  } catch (error) {
    console.error('갤러리 데이터 가져오기 실패:', error);
    return { success: false, error };
  }
}; 