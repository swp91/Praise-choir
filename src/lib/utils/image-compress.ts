/**
 * 이미지를 WebP로 변환하고 압축합니다.
 * @param file 원본 이미지 파일
 * @param quality 압축 품질 (0 ~ 1.0, 기본값 0.82)
 * @param maxWidth 최대 가로 크기 (선택 사항, 비율 유지)
 */
export async function compressAndConvertToWebp(
  file: File,
  quality: number = 0.82,
  maxWidth: number = 1920
): Promise<File> {
  // SSR 등 브라우저 환경이 아닐 경우 그대로 파일 반환
  if (typeof window === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context를 생성할 수 없습니다.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다.'));
            return;
          }

          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
          const newFileName = `${originalName}.webp`;

          const webpFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
}
