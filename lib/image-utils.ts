const MAX_IMAGE_DIMENSION = 1024;

/**
 * Resize an image to fit within MAX_IMAGE_DIMENSION on its longest edge,
 * then re-encode as JPEG base64.
 */
export function resizeImage(
  dataUrl: string
): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = resizedDataUrl.split(",")[1];
      resolve({ base64, dataUrl: resizedDataUrl });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
