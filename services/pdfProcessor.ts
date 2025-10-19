
// This is required for TypeScript to recognize the pdfjsLib global variable
declare const pdfjsLib: any;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Không thể đọc tệp."));
      }

      const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
      
      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        resolve(fullText);
      } catch (error) {
        console.error("Lỗi khi xử lý PDF:", error);
        reject(new Error("Không thể xử lý tệp PDF. Tệp có thể bị hỏng hoặc không được hỗ trợ."));
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc tệp."));
    };

    fileReader.readAsArrayBuffer(file);
  });
};
