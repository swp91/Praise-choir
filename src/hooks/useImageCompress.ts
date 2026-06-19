'use client';

import { useState } from 'react';
import { compressAndConvertToWebp } from '@/lib/utils/image-compress';

export function useImageCompress() {
  const [isCompressing, setIsCompressing] = useState(false);

  const compress = async (file: File): Promise<File> => {
    setIsCompressing(true);
    try {
      return await compressAndConvertToWebp(file);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      return file; // 실패 시 원본 파일 그대로 사용하여 업로드하도록 예외 복구
    } finally {
      setIsCompressing(false);
    }
  };

  return { compress, isCompressing };
}
