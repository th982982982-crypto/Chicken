import React, { useState } from 'react';
import { Transaction } from '../types';
import { analyzeFarmData } from '../services/geminiService';
import { Sparkles, Send, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GeminiAdvisorProps {
  transactions: Transaction[];
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ transactions }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (loading) return;
    setLoading(true);
    setResponse(null);
    const result = await analyzeFarmData(transactions, question);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles size={24} className="text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold">Trợ lý Nông trại AI</h2>
        </div>
        <p className="text-indigo-100 mb-6">
            Sử dụng trí tuệ nhân tạo Gemini để phân tích lợi nhuận, tìm ra các khoản chi lãng phí và đưa ra lời khuyên tối ưu cho trại gà của bạn.
        </p>
        
        <div className="relative">
            <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Đặt câu hỏi (VD: Tháng này lãi bao nhiêu? Chi phí nào cao nhất?)"
                className="w-full py-4 pl-6 pr-14 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-400/50 shadow-lg"
            />
            <button 
                onClick={handleAsk}
                disabled={loading}
                className="absolute right-2 top-2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </button>
        </div>
      </div>

      {response && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 animate-fade-in flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Bot size={24} />
                </div>
            </div>
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{response}</ReactMarkdown>
            </div>
        </div>
      )}
      
      {!response && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setQuestion('Phân tích lợi nhuận 3 tháng gần đây')} className="p-4 bg-white border hover:border-indigo-300 hover:shadow-md rounded-xl text-left text-slate-600 transition-all text-sm">
                  📈 Phân tích lợi nhuận 3 tháng gần đây
              </button>
              <button onClick={() => setQuestion('Dự báo chi phí thức ăn tháng tới')} className="p-4 bg-white border hover:border-indigo-300 hover:shadow-md rounded-xl text-left text-slate-600 transition-all text-sm">
                  🌽 Dự báo chi phí thức ăn
              </button>
              <button onClick={() => setQuestion('Tỷ lệ chi phí thuốc men so với tổng chi')} className="p-4 bg-white border hover:border-indigo-300 hover:shadow-md rounded-xl text-left text-slate-600 transition-all text-sm">
                  💉 Tỷ lệ chi phí thuốc men
              </button>
              <button onClick={() => setQuestion('Đề xuất cách tối ưu hóa chi phí')} className="p-4 bg-white border hover:border-indigo-300 hover:shadow-md rounded-xl text-left text-slate-600 transition-all text-sm">
                  💡 Đề xuất tối ưu hóa
              </button>
          </div>
      )}
    </div>
  );
};

export default GeminiAdvisor;
