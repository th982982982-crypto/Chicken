import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getClient = () => {
    // Falls back to a placeholder if no key is present to prevent crash, but UI handles the warning.
    const key = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey: key });
};

export const analyzeFarmData = async (transactions: Transaction[], question?: string): Promise<string> => {
  const ai = getClient();
  
  // Prepare data summary to save tokens
  const summary = transactions.slice(0, 50).map(t => 
    `${t.date}: ${t.type} - ${t.category} - ${t.amount.toLocaleString()} VND (${t.note})`
  ).join('\n');

  const prompt = `
    Bạn là một chuyên gia quản lý nông trại gà. Dưới đây là dữ liệu giao dịch gần đây của nông trại:
    ---
    ${summary}
    ---
    
    ${question ? `Người dùng hỏi: "${question}"` : 'Hãy phân tích tình hình tài chính của nông trại. Đưa ra nhận xét về lợi nhuận, các khoản chi lớn nhất cần tối ưu, và dự báo ngắn gọn.'}
    
    Trả lời bằng tiếng Việt, ngắn gọn, súc tích, chuyên nghiệp. Định dạng Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Không thể phân tích dữ liệu lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lỗi khi kết nối với trợ lý AI. Vui lòng kiểm tra API Key.";
  }
};
