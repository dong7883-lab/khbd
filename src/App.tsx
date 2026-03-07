import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import { BookOpen, Copy, Download, Loader2, Sparkles, CheckCircle2, FileText, FileDown, Save, History, Edit, Trash2, X, Settings, Lightbulb } from 'lucide-react';
import { curriculum } from './data/curriculum';
import { examplePlans, ExamplePlan } from './data/examples';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SavedPlan {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  grade: string;
  chapter: string;
  lesson: string;
}

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(curriculum[0].id);
  const [selectedChapter, setSelectedChapter] = useState(curriculum[0].chapters[0].id);
  const [selectedLesson, setSelectedLesson] = useState(curriculum[0].chapters[0].lessons[0].id);
  const [periods, setPeriods] = useState('1');
  const [focus, setFocus] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  
  // New states for saving and editing
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [editedResult, setEditedResult] = useState('');
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updatedDesc' | 'updatedAsc' | 'createdDesc' | 'createdAsc' | 'nameAsc' | 'nameDesc'>('updatedDesc');

  // Settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('indigo');
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'
  const [tableStyle, setTableStyle] = useState('default'); // 'default', 'modern', 'colorful', 'bordered'

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('eduplan_saved_plans');
    if (stored) {
      try {
        setSavedPlans(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved plans', e);
      }
    }
    
    const storedSettings = localStorage.getItem('eduplan_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.tableStyle) setTableStyle(parsed.tableStyle);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('eduplan_saved_plans', JSON.stringify(savedPlans));
    } catch (error: any) {
      console.error('Error saving to localStorage:', error);
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        alert('⚠️ LỖI LƯU TRỮ:\nBộ nhớ trình duyệt của bạn đã đầy. Vui lòng mở "Lịch sử giáo án" và xóa bớt một số giáo án cũ để có thể lưu thêm bản mới.');
      } else {
        alert('⚠️ LỖI LƯU TRỮ:\nKhông thể lưu giáo án vào trình duyệt. Vui lòng kiểm tra xem trình duyệt có đang ở chế độ ẩn danh (Incognito/Private) chặn việc lưu trữ dữ liệu hay không.');
      }
    }
  }, [savedPlans]);

  useEffect(() => {
    localStorage.setItem('eduplan_settings', JSON.stringify({ theme, fontSize, tableStyle }));
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, fontSize, tableStyle]);

  const currentGrade = curriculum.find(g => g.id === selectedGrade);
  const currentChapter = currentGrade?.chapters.find(c => c.id === selectedChapter);
  const currentLesson = currentChapter?.lessons.find(l => l.id === selectedLesson);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeId = e.target.value;
    setSelectedGrade(gradeId);
    const grade = curriculum.find(g => g.id === gradeId);
    if (grade) {
      setSelectedChapter(grade.chapters[0].id);
      setSelectedLesson(grade.chapters[0].lessons[0].id);
    }
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    setSelectedChapter(chapterId);
    const chapter = currentGrade?.chapters.find(c => c.id === chapterId);
    if (chapter) {
      setSelectedLesson(chapter.lessons[0].id);
    }
  };

  const handleGenerate = async () => {
    if (!currentGrade || !currentChapter || !currentLesson) return;
    
    setIsGenerating(true);
    setResult('');
    setCopied(false);
    setIsEditing(false);
    setCurrentPlanId(null);

    const prompt = `Bạn là một chuyên gia giáo dục và giáo viên dạy Hóa học cấp THPT xuất sắc.
Hãy soạn một kế hoạch dạy học (giáo án) môn Hóa học theo đúng cấu trúc của Công văn 5512/BGDĐT-GDTrH.
Bài học: ${currentLesson.name}
Chương: ${currentChapter.name}
Khối lớp: ${currentGrade.name} (theo Chương trình GDPT 2018, sách Kết nối tri thức với cuộc sống)
Số tiết dự kiến: ${periods}
Trọng tâm bài học: ${focus || 'Theo chuẩn kiến thức kỹ năng của bài học'}

Yêu cầu bắt buộc về cấu trúc giáo án:
Phần đầu giáo án BẮT BUỘC phải có:
Ngày soạn: ........................
Ngày dạy: ........................

I. MỤC TIÊU
1. Năng lực hóa học
2. Năng lực chung
3. Phẩm chất
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
III. TIẾN TRÌNH DẠY HỌC
1. Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
2. Hoạt động 2: Hình thành kiến thức mới (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
3. Hoạt động 3: Luyện tập (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
4. Hoạt động 4: Vận dụng (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)

Phần cuối giáo án BẮT BUỘC phải có:
Người soạn: ........................
Nhận xét của tổ chuyên môn: ........................

CHÚ Ý QUAN TRỌNG:
- Phần "Tổ chức thực hiện" của TẤT CẢ các hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng) BẮT BUỘC phải trình bày dưới dạng bảng gồm 2 cột: "Hoạt động của Giáo viên" và "Hoạt động của Học sinh". Sử dụng cú pháp Markdown table.
- Xây dựng các Phiếu học tập (nếu có) cần ghi rõ nội dung chi tiết từng câu hỏi/bài tập.
- Viết CHÍNH XÁC các công thức hóa học và toán học bằng cách sử dụng các ký tự Unicode chỉ số dưới/trên (ví dụ: H₂SO₄, Cu²⁺, x²). KHÔNG dùng ký hiệu LaTeX như $, \\.
- Để ngắt dòng hoặc xuống dòng bên trong các ô của bảng Markdown, BẮT BUỘC sử dụng thẻ <br> (ví dụ: Bước 1: ... <br> Bước 2: ...).

Hãy trình bày toàn bộ bằng Markdown. Đảm bảo nội dung chi tiết, khoa học, phù hợp với thực tế giảng dạy và bám sát trọng tâm đã nêu.`;

    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
          setResult(fullText);
        }
      }
    } catch (error: any) {
      console.error('Error generating lesson plan:', error);
      let errorMessage = '### ⚠️ Đã xảy ra lỗi khi tạo giáo án\n\n';
      
      if (error?.message?.toLowerCase().includes('fetch') || error?.message?.toLowerCase().includes('network')) {
        errorMessage += '**Nguyên nhân:** Không thể kết nối đến máy chủ AI do lỗi mạng.\n\n**Cách khắc phục:** Vui lòng kiểm tra lại kết nối Internet (Wi-Fi/4G) của bạn và nhấn nút "Tạo giáo án" lại.';
      } else if (error?.status === 429 || error?.message?.toLowerCase().includes('quota') || error?.message?.toLowerCase().includes('429')) {
        errorMessage += '**Nguyên nhân:** Hệ thống AI đang nhận quá nhiều yêu cầu cùng lúc (quá tải).\n\n**Cách khắc phục:** Vui lòng đợi khoảng 1-2 phút rồi thử lại nhé.';
      } else {
        errorMessage += `**Nguyên nhân:** Quá trình tạo bị gián đoạn đột ngột.\n\n**Cách khắc phục:**\n1. Kiểm tra lại kết nối Internet.\n2. Thử làm mới (refresh) lại trang web (F5).\n3. Nhấn nút "Tạo giáo án" lại một lần nữa.\n\n*(Chi tiết lỗi kỹ thuật: ${error?.message || 'Không rõ'})*`;
      }
      
      setResult(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = () => {
    if (!result || !currentGrade || !currentChapter || !currentLesson) return;
    
    const title = prompt('Nhập tên để lưu giáo án:', currentLesson.name);
    if (!title) return;

    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      title,
      content: result,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      grade: currentGrade.name,
      chapter: currentChapter.name,
      lesson: currentLesson.name,
    };

    setSavedPlans([newPlan, ...savedPlans]);
    setCurrentPlanId(newPlan.id);
    
    setShowSaveSuccess(true);
  };

  const handleUpdatePlan = () => {
    if (!currentPlanId || !result) return;
    
    setSavedPlans(savedPlans.map(plan => 
      plan.id === currentPlanId 
        ? { ...plan, content: result, updatedAt: Date.now() } 
        : plan
    ));
    
    setShowSaveSuccess(true);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa giáo án này không?')) {
      setSavedPlans(savedPlans.filter(plan => plan.id !== id));
      if (currentPlanId === id) {
        setCurrentPlanId(null);
        setResult('');
      }
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setResult(plan.content);
    setCurrentPlanId(plan.id);
    setIsEditing(false);
    setIsHistoryOpen(false);
    
    // Optionally update the select boxes to match the loaded plan
    // This requires finding the IDs based on names
    const grade = curriculum.find(g => g.name === plan.grade);
    if (grade) {
      setSelectedGrade(grade.id);
      const chapter = grade.chapters.find(c => c.name === plan.chapter);
      if (chapter) {
        setSelectedChapter(chapter.id);
        const lesson = chapter.lessons.find(l => l.name === plan.lesson);
        if (lesson) {
          setSelectedLesson(lesson.id);
        }
      }
    }
  };

  const handleLoadExample = (example: ExamplePlan) => {
    setResult(example.content);
    setCurrentPlanId(null); // Treat as a new unsaved plan
    setIsEditing(false);
    setIsExamplesOpen(false);
    
    const grade = curriculum.find(g => g.name === example.grade);
    if (grade) {
      setSelectedGrade(grade.id);
      const chapter = grade.chapters.find(c => c.name === example.chapter);
      if (chapter) {
        setSelectedChapter(chapter.id);
        const lesson = chapter.lessons.find(l => l.name === example.lesson);
        if (lesson) {
          setSelectedLesson(lesson.id);
        }
      }
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setResult(editedResult);
      setIsEditing(false);
    } else {
      setEditedResult(result);
      setIsEditing(true);
    }
  };

  const getTableStyleClasses = () => {
    switch (tableStyle) {
      case 'modern':
        return 'prose-th:bg-transparent prose-th:border-b-2 prose-th:border-slate-800 prose-td:border-b prose-td:border-slate-200 prose-td:border-x-0 prose-th:border-x-0';
      case 'colorful':
        return 'prose-th:bg-primary-500 prose-th:text-white prose-th:border-primary-600 prose-td:border prose-td:border-slate-200 [&_tbody_tr:nth-child(even)]:bg-primary-50/30';
      case 'bordered':
        return 'prose-th:bg-slate-100 prose-th:border-2 prose-th:border-slate-400 prose-td:border-2 prose-td:border-slate-400';
      case 'default':
      default:
        return 'prose-th:bg-slate-100 prose-th:border prose-th:border-slate-300 prose-td:border prose-td:border-slate-300 prose-tr:border-b prose-tr:border-slate-300';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sortedPlans = [...savedPlans].sort((a, b) => {
    switch (sortBy) {
      case 'updatedDesc': return b.updatedAt - a.updatedAt;
      case 'updatedAsc': return a.updatedAt - b.updatedAt;
      case 'createdDesc': return b.createdAt - a.createdAt;
      case 'createdAsc': return a.createdAt - b.createdAt;
      case 'nameAsc': return a.title.localeCompare(b.title);
      case 'nameDesc': return b.title.localeCompare(a.title);
      default: return b.updatedAt - a.updatedAt;
    }
  });

  const handleDownloadPDF = () => {
    if (!resultRef.current) return;
    
    const element = resultRef.current;
    const opt = {
      margin:       15,
      filename:     `Giao_an_${currentLesson?.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleDownloadDoc = () => {
    if (!resultRef.current) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + resultRef.current.innerHTML + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Giao_an_${currentLesson?.name.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = async () => {
    if (!resultRef.current) return;
    
    const htmlString = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${resultRef.current.innerHTML}</body></html>`;
    try {
      const blob = await asBlob(htmlString);
      saveAs(blob as Blob, `Giao_an_${currentLesson?.name.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Có lỗi xảy ra khi tạo file DOCX. Vui lòng thử tải dạng DOC hoặc PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">EduPlan AI</h1>
            <span className="ml-2 text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:inline-block">
              Hóa học 2018
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExamplesOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Lightbulb size={18} />
              <span className="hidden sm:inline-block">Giáo án mẫu</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Settings size={18} />
              <span className="hidden sm:inline-block">Cài đặt</span>
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <History size={18} />
              <span className="hidden sm:inline-block">Lịch sử giáo án</span>
              {savedPlans.length > 0 && (
                <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {savedPlans.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Column - Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-primary-500" size={20} />
              Thông tin bài dạy
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khối lớp</label>
                <select 
                  value={selectedGrade} 
                  onChange={handleGradeChange}
                  className="w-full rounded-xl border-slate-300 bg-slate-50 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                >
                  {curriculum.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chương</label>
                <select 
                  value={selectedChapter} 
                  onChange={handleChapterChange}
                  className="w-full rounded-xl border-slate-300 bg-slate-50 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                >
                  {currentGrade?.chapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bài học</label>
                <select 
                  value={selectedLesson} 
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full rounded-xl border-slate-300 bg-slate-50 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                >
                  {currentChapter?.lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số tiết dự kiến</label>
                <input 
                  type="number" 
                  min="1"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                  className="w-full rounded-xl border-slate-300 bg-slate-50 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="Ví dụ: 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trọng tâm bài học (Tùy chọn)</label>
                <textarea 
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-slate-300 bg-slate-50 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Nhập những điểm cần nhấn mạnh, phương pháp đặc thù..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang tạo giáo án...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Tạo giáo án 5512
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Result */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px] sm:min-h-[600px]">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
              <h3 className="font-medium text-slate-700">Kết quả giáo án</h3>
              <div className="flex flex-wrap gap-2">
                {currentPlanId ? (
                  <button
                    onClick={handleUpdatePlan}
                    disabled={!result || isGenerating || isEditing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={16} />
                    <span className="hidden sm:inline">Cập nhật</span>
                    <span className="sm:hidden">Lưu</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSavePlan}
                    disabled={!result || isGenerating || isEditing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={16} />
                    Lưu
                  </button>
                )}
                <button
                  onClick={handleEditToggle}
                  disabled={!result || isGenerating}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEditing 
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                      : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isEditing ? <CheckCircle2 size={16} /> : <Edit size={16} />}
                  <span className="hidden sm:inline">{isEditing ? 'Hoàn tất sửa' : 'Chỉnh sửa'}</span>
                  <span className="sm:hidden">{isEditing ? 'Xong' : 'Sửa'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!result || isGenerating || isEditing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  <span className="sm:hidden">{copied ? 'Đã chép' : 'Chép'}</span>
                </button>
                <button
                  onClick={handleDownloadDoc}
                  disabled={!result || isGenerating || isEditing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText size={16} />
                  DOC
                </button>
                <button
                  onClick={handleDownloadDocx}
                  disabled={!result || isGenerating || isEditing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText size={16} />
                  DOCX
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!result || isGenerating || isEditing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileDown size={16} />
                  PDF
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
              {!result && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-10 sm:py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <BookOpen size={32} className="text-slate-300" />
                  </div>
                  <p className="px-4">Chọn thông tin và nhấn "Tạo giáo án" để bắt đầu</p>
                </div>
              ) : isEditing ? (
                <div className="flex flex-col h-full">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm p-3 rounded-xl mb-3 flex items-start gap-2">
                    <Lightbulb size={16} className="mt-0.5 shrink-0" />
                    <p><strong>Mẹo chỉnh sửa bảng:</strong> Để thêm cột, hãy thêm dấu <code>|</code> và tiêu đề mới vào dòng đầu tiên, sau đó thêm <code>|---|</code> ở dòng thứ hai, và thêm dữ liệu tương ứng ở các dòng dưới. Để xóa cột, hãy xóa các phần tương ứng giữa các dấu <code>|</code>.</p>
                  </div>
                  <textarea
                    value={editedResult}
                    onChange={(e) => setEditedResult(e.target.value)}
                    className="w-full h-full min-h-[500px] p-4 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                    placeholder="Chỉnh sửa nội dung Markdown tại đây..."
                  />
                </div>
              ) : (
                <div 
                  ref={resultRef}
                  className={`prose ${fontSize === 'sm' ? 'prose-sm' : fontSize === 'lg' ? 'prose-lg' : 'prose-sm sm:prose-base'} prose-slate max-w-none prose-headings:font-bold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg prose-table:w-full prose-th:p-2 sm:prose-th:p-3 prose-td:p-2 sm:prose-td:p-3 ${getTableStyleClasses()}`}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto w-full my-4 sm:my-6">
                          <table className="min-w-full" {...props} />
                        </div>
                      )
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <History className="text-primary-500" size={20} />
                Lịch sử giáo án đã lưu
              </h2>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {savedPlans.length > 0 && (
              <div className="px-4 py-3 border-b border-slate-100 bg-white flex justify-end items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Sắp xếp theo:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-slate-300 bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                >
                  <option value="updatedDesc">Mới cập nhật nhất</option>
                  <option value="updatedAsc">Cập nhật cũ nhất</option>
                  <option value="createdDesc">Mới tạo nhất</option>
                  <option value="createdAsc">Tạo cũ nhất</option>
                  <option value="nameAsc">Tên (A-Z)</option>
                  <option value="nameDesc">Tên (Z-A)</option>
                </select>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4">
              {savedPlans.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p>Chưa có giáo án nào được lưu.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedPlans.map(plan => (
                    <div 
                      key={plan.id} 
                      className={`border rounded-xl p-4 transition-all cursor-pointer hover:border-primary-300 hover:shadow-sm ${currentPlanId === plan.id ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 bg-white'}`}
                      onClick={() => handleLoadPlan(plan)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-lg mb-1">{plan.title}</h3>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                            <span className="bg-slate-100 px-2 py-1 rounded-md">{plan.grade}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded-md truncate max-w-[200px]">{plan.chapter}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded-md truncate max-w-[200px]">{plan.lesson}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Cập nhật lần cuối: {new Date(plan.updatedAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa giáo án"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Examples Modal */}
      {isExamplesOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-amber-50">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <Lightbulb className="text-amber-500" size={20} />
                Thư viện giáo án mẫu
              </h2>
              <button 
                onClick={() => setIsExamplesOpen(false)}
                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="grid gap-4">
                {examplePlans.map(example => (
                  <div 
                    key={example.id} 
                    className="border border-slate-200 rounded-xl p-4 transition-all cursor-pointer hover:border-amber-400 hover:shadow-md bg-white group"
                    onClick={() => handleLoadExample(example)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-lg mb-2 group-hover:text-amber-700 transition-colors">{example.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md font-medium">{example.grade}</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md">{example.chapter}</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md">{example.lesson}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center justify-center bg-amber-100 text-amber-700 p-2 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <BookOpen size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="text-primary-500" size={20} />
                Cài đặt giao diện
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Màu chủ đạo</h3>
                <div className="flex gap-3">
                  {[
                    { id: 'indigo', color: 'bg-[#4f46e5]' },
                    { id: 'emerald', color: 'bg-[#059669]' },
                    { id: 'rose', color: 'bg-[#e11d48]' },
                    { id: 'amber', color: 'bg-[#d97706]' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center transition-transform hover:scale-110 ${theme === t.id ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      aria-label={`Theme ${t.id}`}
                    >
                      {theme === t.id && <CheckCircle2 size={20} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Cỡ chữ (Giáo án)</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sm', label: 'Nhỏ' },
                    { id: 'base', label: 'Vừa' },
                    { id: 'lg', label: 'Lớn' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFontSize(s.id)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        fontSize === s.id 
                          ? 'bg-primary-50 border-primary-500 text-primary-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Kiểu bảng (Table Style)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'default', label: 'Cơ bản (Viền mỏng)' },
                    { id: 'modern', label: 'Hiện đại (Chỉ viền ngang)' },
                    { id: 'colorful', label: 'Nổi bật (Tiêu đề màu)' },
                    { id: 'bordered', label: 'Đậm nét (Viền dày)' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setTableStyle(s.id)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        tableStyle === s.id 
                          ? 'bg-primary-50 border-primary-500 text-primary-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Lưu thành công!</h2>
              <p className="text-slate-600 mb-6">Giáo án của bạn đã được lưu. Bạn có muốn tải xuống ngay không?</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { handleDownloadDocx(); setShowSaveSuccess(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                >
                  <FileText size={18} />
                  Tải xuống DOCX
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { handleDownloadDoc(); setShowSaveSuccess(false); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <FileText size={18} />
                    Tải DOC
                  </button>
                  <button
                    onClick={() => { handleDownloadPDF(); setShowSaveSuccess(false); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <FileDown size={18} />
                    Tải PDF
                  </button>
                </div>
                <button
                  onClick={() => setShowSaveSuccess(false)}
                  className="mt-2 w-full px-4 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
