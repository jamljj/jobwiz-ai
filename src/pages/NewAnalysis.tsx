import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Building2, Briefcase, FileText, Info, CheckCircle2, Sparkles, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiService, AnalysisRequest } from '../lib/aiService';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// 配置 PDF.js worker（使用本地 worker 避免 CDN 加载问题）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// 从 PDF 中提取文本内容
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // 将文本项连接成字符串，保留基本的段落结构
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s{2,}/g, '\n'); // 将多个空格替换为换行
    fullText += pageText + '\n\n';
  }
  return fullText.trim();
}

// 从 Word (.docx) 中提取文本内容
async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [formData, setFormData] = useState({
    company: '字节跳动',
    position: '高级产品经理',
    jd: `职位描述：
1. 负责字节跳动核心业务的增长策略设计，通过数据驱动发现增长点，负责 GTM（Go-to-Market）方案的制定与执行；
2. 深度分析行业趋势与竞品动向，定义产品中长期发展规划并推动落地；
3. 协同研发、设计、市场等多团队，确保产品高质量交付及市场目标达成；
4. 构建科学的评估体系，通过 A/B Test 及全链路数据分析持续优化用户留存。

任职要求：
1. 5年以上互联网产品经验，有成功的大规模用户增长或商业化案例；
2. 具备极强的数据敏感度，能从复杂数据中洞察底层逻辑；
3. 出色的沟通协调能力，能够在高压环境下驱动跨部门合作；
4. 对 AI 技术或新兴社交形态有深刻理解者优先。`,
    summary: '您好，我是张小明。拥有 6 年互联网产品经验，曾主导某社交 App 从 0 到 1000 万日活的增长历程。我擅长利用数据看板驱动决策，在 GTM 策略上有成熟的方法论沉淀。我非常认可字节跳动的“始终创业”文化，希望通过本次分析了解我过往在增长领域的经验如何更好地契合该高级产品经理岗位。'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      // 判断文件类型：优先按 MIME type，其次按扩展名
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      const isWord = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     fileName.endsWith('.docx');

      if (isPDF) {
        setFile(selectedFile);
        setIsUploading(true);

        try {
          const resumeText = await extractTextFromPDF(selectedFile);

          // 检测是否为扫描版 PDF（提取的文字很少或几乎为空）
          if (!resumeText || resumeText.trim().length < 50) {
            setIsUploading(false);
            alert('⚠️ 无法从 PDF 中提取文本。\n\n可能原因：\n1. PDF 是扫描版（图片合成），文字无法直接提取\n2. PDF 受加密保护\n3. PDF 内容为空\n\n💡 建议：将 PDF 另存为 Word 格式后重新上传，或联系客服获取帮助。');
            return;
          }

          setResumeText(resumeText);
          setIsUploading(false);

          if (resumeText.length > 100000) {
            alert('简历内容较长，系统会自动截断以符合AI模型的输入限制。');
          } else {
            alert('PDF 解析成功，共提取 ' + resumeText.length + ' 个字符。');
          }
        } catch (error: any) {
          console.error('PDF 解析失败:', error);
          setIsUploading(false);
          alert('PDF 解析失败（' + (error?.message || '未知错误') + '）\n\n💡 建议：将 PDF 另存为 Word 格式（.docx）后重新上传。');
        }
      } else if (isWord) {
        // Word 文档使用 mammoth 解析
        setFile(selectedFile);
        setIsUploading(true);

        try {
          const resumeText = await extractTextFromWord(selectedFile);

          if (!resumeText || resumeText.trim().length < 50) {
            setIsUploading(false);
            alert('Word 文档内容读取失败，可能是文档为空或受保护。');
            return;
          }

          setResumeText(resumeText);
          setIsUploading(false);

          if (resumeText.length > 100000) {
            alert('简历内容较长，系统会自动截断以符合AI模型的输入限制。');
          } else {
            alert('Word 文档解析成功，共提取 ' + resumeText.length + ' 个字符。');
          }
        } catch (error: any) {
          console.error('Word 解析失败:', error);
          setIsUploading(false);
          alert('Word 文档解析失败（' + (error?.message || '未知错误') + '）\n\n💡 建议：确保文档是 .docx 格式（Word 2007及以上）。');
        }
      } else {
        // 文本文件直接读取
        setFile(selectedFile);
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setResumeText(text);
          setIsUploading(false);

          if (text.length > 100000) {
            alert('简历内容过长，系统会自动截断以符合AI模型的输入限制。');
          } else {
            alert('简历内容已读取，共 ' + text.length + ' 个字符。');
          }
        };
        reader.onerror = () => {
          setIsUploading(false);
          alert('文件读取失败，请重试');
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      alert('请先上传您的简历');
      return;
    }
    if (!formData.company.trim()) {
      alert('请输入目标公司');
      return;
    }
    if (!formData.position.trim()) {
      alert('请输入申请岗位');
      return;
    }
    if (!formData.jd.trim()) {
      alert('请输入岗位 JD 描述');
      return;
    }
    if (!resumeText) {
      alert('简历内容读取失败，请重新上传');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const request: AnalysisRequest = {
        resume: resumeText,
        company: formData.company,
        position: formData.position,
        jd: formData.jd,
        summary: formData.summary
      };
      
      const result = await aiService.analyzeResume(request);
      
      navigate('/analysis/result', {
        state: {
          ...formData,
          fileName: file.name,
          analysisResult: result
        }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="pt-12 pb-24 px-6 max-w-4xl mx-auto flex-grow">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">开启职场新篇章</h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
          上传您的简历并输入岗位信息，AI 将为您提供深度匹配分析、关键词提取与简历优化建议。
        </p>
      </header>

      <section className="space-y-6">
        {/* Resume Upload Area */}
        <div className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10 shadow-sm">
          <div 
            className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low/50 transition-colors group"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            {isUploading ? (
              <>
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-base font-bold text-on-surface mb-1">正在读取简历内容...</h3>
                <p className="text-on-surface-variant text-xs mb-6">请稍候</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-base font-bold text-on-surface mb-1">点击或拖拽简历至此处</h3>
                <p className="text-on-surface-variant text-xs mb-6">支持 PDF, Word 格式 (最大 10MB)</p>
                
                {file ? (
                  <div className="flex items-center gap-3 bg-secondary-container/20 px-4 py-2.5 rounded-xl border border-secondary-container/30">
                    <CheckCircle2 className="w-5 h-5 text-on-secondary-container" />
                    <span className="text-sm font-bold text-on-secondary-container">{file.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-secondary-container/70 bg-secondary-container/30 px-1.5 py-0.5 rounded ml-1">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20">
                    <FileText className="w-5 h-5 text-on-surface-variant" />
                    <span className="text-sm font-bold text-on-surface-variant">尚未选择文件</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Job Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">目标公司</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none text-on-surface font-semibold transition-all" 
                type="text" 
                placeholder="例如：字节跳动"
                value={formData.company}
                onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">申请岗位</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none text-on-surface font-semibold transition-all" 
                type="text" 
                placeholder="例如：高级产品经理"
                value={formData.position}
                onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Detailed Text Areas */}
        <div className="space-y-5">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">岗位 JD 描述</label>
              <span className="text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">建议粘贴完整 JD</span>
            </div>
            <textarea 
              className="w-full p-5 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none text-on-surface text-sm leading-relaxed transition-all resize-none" 
              rows={8}
              placeholder="粘贴职位描述..."
              value={formData.jd}
              onChange={e => setFormData(prev => ({ ...prev, jd: e.target.value }))}
            />
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">个人简介/补充说明</label>
              <span className="text-[11px] text-on-surface-variant">（可选）</span>
            </div>
            <textarea 
              className="w-full p-5 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none text-on-surface text-sm leading-relaxed transition-all resize-none" 
              rows={4}
              placeholder="有什么想让 AI 额外关注的？"
              value={formData.summary}
              onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6 flex flex-col items-center gap-4">
          <button 
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className={`w-full md:w-72 py-4 rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
              isAnalyzing 
                ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed' 
                : 'primary-gradient text-white shadow-primary/25 hover:shadow-primary/40'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <BarChart3 className="w-6 h-6" />
                开始 AI 深度分析
              </>
            )}
          </button>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span className="text-xs font-medium">您的简历隐私已受加密保护，仅用于分析建议</span>
          </div>
        </div>
      </section>

      {/* Floating Decor */}
      <div className="fixed bottom-10 right-10 hidden lg:block z-40">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-lowest p-5 rounded-2xl shadow-2xl max-w-[280px] border border-outline-variant/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary fill-primary" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">专业建议</h4>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
            针对字节跳动的岗位，建议在简历中突出<strong>“数据驱动”</strong>、<strong>“闭环思考”</strong>以及<strong>“抗压能力”</strong>等关键词。
          </p>
          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3"></div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
