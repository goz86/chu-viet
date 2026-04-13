'use client';

import React, { useState, useMemo } from 'react';

/* ================================================================
   KOREAN FONTS
   ================================================================ */
const KOREAN_FONTS = [
  // --- Chuẩn ---
  { label: 'Nanum Gothic', value: 'Nanum Gothic', style: 'sans-serif', desc: 'Gọn gàng, rõ nét' },
  { label: 'Nanum Myeongjo', value: 'Nanum Myeongjo', style: 'serif', desc: 'Thanh lịch, có chân' },
  { label: 'Gothic A1', value: 'Gothic A1', style: 'sans-serif', desc: 'Hiện đại, sạch' },
  // --- Viết tay ---
  { label: 'Nanum Pen', value: 'Nanum Pen Script', style: 'cursive', desc: '✍️ Bút bi viết tay' },
  { label: 'Gaegu', value: 'Gaegu', style: 'cursive', desc: '✍️ Viết tay học sinh' },
  { label: 'Gamja Flower', value: 'Gamja Flower', style: 'cursive', desc: '✍️ Viết tay dễ thương' },
  { label: 'Hi Melody', value: 'Hi Melody', style: 'cursive', desc: '✍️ Ghi chú thoải mái' },
  { label: 'East Sea Dokdo', value: 'East Sea Dokdo', style: 'cursive', desc: '✍️ Bút lông nghệ thuật' },
  { label: 'Poor Story', value: 'Poor Story', style: 'cursive', desc: '✍️ Kể chuyện thân mật' },
  // --- Trang trí ---
  { label: 'Jua', value: 'Jua', style: 'sans-serif', desc: 'Tròn, dễ thương' },
  { label: 'Do Hyeon', value: 'Do Hyeon', style: 'sans-serif', desc: 'Đậm, nổi bật' },
];

/* ================================================================
   CONSTANTS
   ================================================================ */
const MARGIN_MM = 15;
const HEADER_H_MM = 32;
const CONT_HEADER_H_MM = 14;
const SEPARATOR_H_MM = 5;

const PRESETS = [
  { label: 'Dễ', emoji: '🟢', gridCols: 8, traceRepeat: 2, emptyRows: 3, desc: 'Ô to, ít cột' },
  { label: 'Trung bình', emoji: '🟡', gridCols: 12, traceRepeat: 1, emptyRows: 2, desc: 'Cân bằng' },
  { label: 'Nâng cao', emoji: '🔴', gridCols: 16, traceRepeat: 1, emptyRows: 1, desc: 'Ô nhỏ, nhiều cột' },
  { label: 'TOPIK', emoji: '📝', gridCols: 20, traceRepeat: 0, emptyRows: 2, desc: 'Giấy thi Wongonji 20 ô' },
] as const;

const BG_COLORS = [
  { label: 'Trắng', value: '#FFFFFF' },
  { label: 'Xanh', value: '#DAEAF6' },
  { label: 'Hồng', value: '#F6DAE4' },
  { label: 'Vàng', value: '#FFF3D1' },
  { label: 'Xám', value: '#E8E8E8' },
  { label: 'Xanh lá', value: '#D6F0D6' },
];

const GRID_COLORS = [
  { label: 'Xám', value: '#bbb', tailwind: 'bg-slate-400' },
  { label: 'Xanh Lá', value: '#228b22', tailwind: 'bg-green-600' },
  { label: 'Đỏ Cam', value: '#e67e22', tailwind: 'bg-orange-500' },
  { label: 'Đen', value: '#111', tailwind: 'bg-black' },
];

/* ================================================================
   TYPES
   ================================================================ */
interface SentenceBlock {
  sentence: string;
  charRows: string[][];
}

/* ================================================================
   HELPERS
   ================================================================ */
/** Split sentence into rows of characters. Spaces become empty cells.
 *  If sentence > cols, auto-wraps to next row(s). */
function sentenceToCharRows(sentence: string, cols: number): string[][] {
  const chars: string[] = [];
  for (const ch of sentence) {
    chars.push(ch === ' ' ? '' : ch);
  }
  if (chars.length === 0) return [Array(cols).fill('')];

  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += cols) {
    const row = chars.slice(i, i + cols);
    while (row.length < cols) row.push('');
    rows.push(row);
  }
  return rows;
}

/* ================================================================
   HELPERS: Trace color gradient
   ================================================================ */
function getTraceColor(tIdx: number, total: number): string {
  // First trace row is darkest, last is lightest
  const startGray = 170; // ~#aaa
  const endGray = 230;   // ~#e6e6e6
  if (total <= 1) return 'rgb(200, 200, 200)';
  const gray = Math.round(startGray + (tIdx / (total - 1)) * (endGray - startGray));
  return `rgb(${gray}, ${gray}, ${gray})`;
}

/* ================================================================
   CELL COMPONENT
   ================================================================ */
function Cell({
  ch,
  cellH,
  fontSize,
  bg,
  color,
  fontWeight,
  borderColor,
  borderStyle,
  showGuides,
}: {
  ch: string;
  cellH: number;
  fontSize: number;
  bg: string;
  color: string;
  fontWeight: number;
  borderColor: string;
  borderStyle: string;
  showGuides?: boolean;
}) {
  const renderGuides = showGuides;

  return (
    <div
      style={{
        height: `${cellH}mm`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `0.5px ${borderStyle} ${borderColor}`,
        backgroundColor: bg,
        fontSize: `${fontSize}mm`,
        fontWeight,
        color,
        boxSizing: 'border-box',
        lineHeight: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Cross guide lines */}
      {renderGuides && (
        <>
          {/* Vertical center line */}
          <div style={{
            position: 'absolute',
            top: '10%',
            bottom: '10%',
            left: '50%',
            width: 0,
            borderLeft: '0.8px dashed rgba(200, 200, 200, 0.6)',
            transform: 'translateX(-0.4px)',
          }} />
          {/* Horizontal center line */}
          <div style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            top: '50%',
            height: 0,
            borderTop: '0.8px dashed rgba(200, 200, 200, 0.6)',
            transform: 'translateY(-0.4px)',
          }} />
        </>
      )}
      {ch}
    </div>
  );
}

/* ================================================================
   GRID ROW COMPONENT
   ================================================================ */
function GridRow({
  chars,
  gridCols,
  cellH,
  fontSize,
  bg,
  color,
  fontWeight,
  borderColor,
  borderStyle,
  fontFamily,
  showGuides,
}: {
  chars: string[];
  gridCols: number;
  cellH: number;
  fontSize: number;
  bg: string;
  color: string;
  fontWeight: number;
  borderColor: string;
  borderStyle: string;
  fontFamily?: string;
  showGuides?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        width: '100%',
        fontFamily: fontFamily || "'Nanum Gothic', sans-serif",
      }}
    >
      {chars.map((ch, i) => (
        <Cell
          key={i}
          ch={ch}
          cellH={cellH}
          fontSize={fontSize}
          bg={bg}
          color={color}
          fontWeight={fontWeight}
          borderColor={borderColor}
          borderStyle={borderStyle}
          showGuides={showGuides}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Home() {
  // --- Text ---
  const [text, setText] = useState(
    '꽃이 피었습니다.\n새싹이 돋았습니다.\n바람이 붑니다.\n시냇물이 흘러갑니다.'
  );

  // --- Grid Settings ---
  const [gridCols, setGridCols] = useState(12);
  const [traceRepeat, setTraceRepeat] = useState(1);
  const [emptyRows, setEmptyRows] = useState(2);

  // --- Style Settings ---
  const [exampleBg, setExampleBg] = useState('#DAEAF6');
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed'>('solid');
  const [selectedFont, setSelectedFont] = useState(KOREAN_FONTS[0]);
  const [showGuides, setShowGuides] = useState(true);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isTopikMode, setIsTopikMode] = useState(false);
  const [gridColor, setGridColor] = useState('#bbb');
  const [isInterleaved, setIsInterleaved] = useState(false);

  // --- Character Stats ---
  const charStats = useMemo(() => {
    const raw = text.replace(/\n/g, '');
    const noSpaces = raw.replace(/\s/g, '');
    return {
      total: raw.length,
      noSpaces: noSpaces.length,
    };
  }, [text]);

  // --- Page Settings ---
  const [headerText, setHeaderText] = useState('한글공부');
  const [subText, setSubText] = useState('문장쓰기');
  const [showMeta, setShowMeta] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  // ====== A4 CALCULATIONS (mm) ======
  const pageW = orientation === 'portrait' ? 210 : 297;
  const pageH = orientation === 'portrait' ? 297 : 210;
  const usableW = pageW - 2 * MARGIN_MM;
  const usableH = pageH - 2 * MARGIN_MM;
  const cellW = usableW / gridCols;
  const cellH = cellW; // square cells
  const charFontSize = cellH * 0.55;

  // ====== PROCESS TEXT ======
  const blocks: SentenceBlock[] = useMemo(
    () => {
      const b = text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((sentence) => ({
          sentence,
          charRows: sentenceToCharRows(sentence, gridCols),
        }));
      
      // If TOPIK mode and no text, provide one empty block to render the grid
      if (b.length === 0 && isTopikMode) {
        return [{ sentence: '', charRows: [] }];
      }
      return b;
    },
    [text, gridCols, isTopikMode]
  );

  // ====== PAGINATION ======
  const pages: SentenceBlock[][] = useMemo(() => {
    const calcBlockH = (b: SentenceBlock) => {
      const n = b.charRows.length;
      if (isInterleaved) {
        // Pattern: n * (1 Sample + traceRepeat Traces + emptyRows Empties)
        return n * (1 + traceRepeat + emptyRows) * cellH + SEPARATOR_H_MM;
      }
      return (n + n * traceRepeat + emptyRows) * cellH + SEPARATOR_H_MM;
    };

    const result: SentenceBlock[][] = [];
    let page: SentenceBlock[] = [];
    let used = HEADER_H_MM;

    for (const block of blocks) {
      const bh = calcBlockH(block);
      if (used + bh > usableH && page.length > 0) {
        result.push(page);
        page = [];
        used = CONT_HEADER_H_MM;
      }
      page.push(block);
      used += bh;
    }

    if (page.length > 0) result.push(page);
    if (result.length === 0) result.push([]);
    return result;
  }, [blocks, traceRepeat, emptyRows, cellH, usableH]);

  const totalPages = pages.length;

  // ====== WARNINGS ======
  const longestCharCount = useMemo(() => {
    let max = 0;
    for (const b of blocks) {
      let len = 0;
      for (const ch of b.sentence) len++;
      if (len > max) max = len;
    }
    return max;
  }, [blocks]);

  const maxWrapRows = Math.ceil(longestCharCount / gridCols);

  // ====== HANDLERS ======
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setGridCols(p.gridCols);
    setTraceRepeat(p.traceRepeat);
    setEmptyRows(p.emptyRows);
    setExampleBg('#DAEAF6');
    if (p.label === 'TOPIK') {
      setIsTopikMode(true);
      setGridColor('#000000'); // Black for Topik as requested
      setShowGuides(false);
      setEmptyRows(24);
      setIsInterleaved(false);
    } else {
      setIsTopikMode(false);
      setGridColor('#bbb');
      setShowGuides(true);
    }
  };

  const handleSmartSplit = () => {
    if (!text.trim()) return;
    // Split by common Korean sentence endings, then clean up
    const sentences = text
      .replace(/([.?!])\s*/g, '$1\n')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setText(sentences.join('\n'));
  };

  // ====== RENDER ======
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* === Dynamic Print Styles + Google Fonts === */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&family=East+Sea+Dokdo&family=Gaegu:wght@400;700&family=Gamja+Flower&family=Gothic+A1:wght@400;700;800&family=Hi+Melody&family=Jua&family=Nanum+Gothic:wght@400;700;800&family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Pen+Script&family=Poor+Story&display=swap');
        @page { size: A4 ${orientation}; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          html, body, main { 
            height: auto !important; 
            overflow: visible !important;
            background: white !important;
          }
          .print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
          }
          .worksheet-page {
            width: ${pageW}mm !important;
            height: ${pageH}mm !important;
            padding: ${MARGIN_MM}mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
          }
          .worksheet-page:last-child { page-break-after: auto; }
          .sentence-block { page-break-inside: avoid; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          SIDEBAR
          ═══════════════════════════════════════════ */}
      <aside className="no-print w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 overflow-y-auto md:h-screen md:sticky md:top-0">
        {/* Title */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="App Logo"
            className="w-12 h-12 rounded-xl shadow-sm border border-slate-100 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Luyện chữ Hàn</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Tạo bài tập viết chữ Hàn chuyên nghiệp · Xuất PDF chuẩn A4
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ⚡ Preset nhanh
          </p>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                title={p.desc}
                className="flex-1 px-2 py-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center active:scale-95"
              >
                <div className="text-lg">{p.emoji}</div>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  {p.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Settings */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {/* --- Grid Layout --- */}
          <details open>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 py-1.5 select-none">
              📐 Bố cục lưới
            </summary>
            <div className="mt-2 flex flex-col gap-3 pl-1">
              <div>
                <label className="text-xs text-slate-500">
                  Số ô mỗi hàng:{' '}
                  <strong className="text-blue-600">{gridCols}</strong>
                </label>
                <input
                  type="range"
                  min="6"
                  max="25"
                  value={gridCols}
                  onChange={(e) => setGridCols(+e.target.value)}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-slate-400">
                  Cỡ ô: {cellW.toFixed(1)}mm × {cellH.toFixed(1)}mm
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Số dòng đồ mờ:{' '}
                  <strong className="text-blue-600">{traceRepeat}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={traceRepeat}
                  onChange={(e) => setTraceRepeat(+e.target.value)}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Số dòng trống:{' '}
                  <strong className="text-blue-600">{emptyRows}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={emptyRows}
                  onChange={(e) => setEmptyRows(+e.target.value)}
                  className="w-full accent-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  className="accent-blue-500"
                />
                Hiện đường dẫn chữ thập (+)
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isInterleaved}
                  onChange={(e) => setIsInterleaved(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="font-semibold text-blue-600">🔄 Chế độ xen kẽ hàng</span>
              </label>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  🎨 Màu đường kẻ ô
                </label>
                <div className="flex gap-2">
                  {GRID_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setGridColor(c.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        gridColor === c.value
                          ? 'border-blue-500 scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      } ${c.tailwind}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setText('');
                    setEmptyRows(20);
                    setTraceRepeat(0);
                  }}
                  className="w-full py-2 px-3 border border-dashed border-slate-300 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  🧹 Dọn dẹp & Tạo trang trắng
                </button>
              </div>
            </div>
          </details>

          {/* --- Style --- */}
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 py-1.5 select-none">
              🎨 Kiểu dáng
            </summary>
            <div className="mt-2 flex flex-col gap-3 pl-1">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  Màu nền dòng mẫu
                </label>
                <div className="flex gap-2">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setExampleBg(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        exampleBg === c.value
                          ? 'border-blue-500 scale-110 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  Kiểu viền ô
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBorderStyle('solid')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      borderStyle === 'solid'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    ── Nét liền
                  </button>
                  <button
                    onClick={() => setBorderStyle('dashed')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      borderStyle === 'dashed'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    - - Nét đứt
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  Phông chữ Hàn
                </label>
                <div className="flex flex-col gap-1.5">
                  {KOREAN_FONTS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSelectedFont(f)}
                      className={`w-full px-3 py-2 rounded-lg border text-left transition-all ${
                        selectedFont.value === f.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        style={{ fontFamily: `'${f.value}', ${f.style}` }}
                        className="text-sm text-slate-700"
                      >
                        한글 가나다 - {f.label}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        {f.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* --- Page Settings --- */}
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 py-1.5 select-none">
              📄 Trang giấy
            </summary>
            <div className="mt-2 flex flex-col gap-3 pl-1">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Phụ đề
                </label>
                <input
                  type="text"
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMeta}
                  onChange={(e) => setShowMeta(e.target.checked)}
                  className="accent-blue-500"
                />
                Hiện ô ghi 월 / 일 / 이름
              </label>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  Hướng giấy
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      orientation === 'portrait'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    📃 Dọc (Portrait)
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      orientation === 'landscape'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    📄 Ngang (Landscape)
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Download Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            📥 Tải xuống PDF ({totalPages} trang)
          </button>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-[10px] text-amber-800 font-bold uppercase mb-1">💡 Mẹo in chuẩn A4:</p>
            <ul className="text-[10px] text-amber-700 space-y-1 list-disc pl-3 leading-tight">
              <li>Lề (Margins): Chọn <strong>None</strong></li>
              <li>Tỷ lệ (Scale): Chọn <strong>100%</strong></li>
              <li>Tùy chọn: Bật <strong>Background Graphics</strong></li>
            </ul>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 px-2">
            Chọn <strong>&quot;Save as PDF&quot;</strong> trong hộp thoại in của trình duyệt
          </p>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN PREVIEW AREA
          ═══════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200/50">
        {/* Toolbar */}
        <div className="no-print p-3 px-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <h2 className="text-sm font-semibold text-slate-600">
            👀 Bản xem trước
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {blocks.length} câu · {totalPages} trang ·{' '}
              {orientation === 'portrait' ? 'Dọc' : 'Ngang'}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
              ● Live
            </span>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex flex-col items-center p-4 md:p-8 gap-8 print-container">
          {/* Centralized Editor Section */}
          <div className="no-print w-full max-w-[210mm] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {isTopikMode ? 'Đề bài / Nội dung viết' : 'Văn bản cần luyện'}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSmartSplit}
                    className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg hover:bg-amber-100 transition-all border border-amber-100"
                  >
                    ✂️ Tách câu
                  </button>
                  <button
                    onClick={() => setIsEditorExpanded(true)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    🔍 Toàn màn hình
                  </button>
                </div>
              </div>
              <div className="p-5">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-base text-slate-700 leading-relaxed font-medium"
                  placeholder={isTopikMode ? "Nhập đề bài hoặc nội dung bài luận TOPIK tại đây..." : "Nhập câu tiếng Hàn của bạn tại đây..."}
                />
                <div className="flex justify-between mt-3 items-center">
                  <div className="flex gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng ký tự</span>
                      <span className="text-lg font-black text-blue-600 leading-none">{charStats.total}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Không cách</span>
                      <span className="text-lg font-black text-slate-600 leading-none">{charStats.noSpaces}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Dự kiến</p>
                    <p className="text-xs font-bold text-slate-700">{totalPages} trang PDF</p>
                  </div>
                </div>
                {maxWrapRows > 2 && !isTopikMode && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                    <span className="text-xl">⚠</span>
                    <p className="text-xs text-amber-700 font-medium leading-tight">
                      <b>Câu quá dài:</b> Hàng mẫu có {longestCharCount} ký tự và sẽ được ngắt thành {maxWrapRows} dòng. Hãy xem lại nếu bạn muốn khống chế trên 1 dòng.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pages.map((pageBlocks, pIdx) => (
            <div
              key={pIdx}
              className="worksheet-page bg-white relative"
              style={{
                width: `${pageW}mm`,
                minHeight: `${pageH}mm`,
                padding: `${MARGIN_MM}mm`,
                boxSizing: 'border-box',
                fontFamily: `'${selectedFont.value}', ${selectedFont.style}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* ---------- PAGE HEADER ---------- */}
              {/* ---------- PAGE HEADER ---------- */}
              {pIdx === 0 ? (
                isTopikMode ? (
                  <div className="flex flex-col mb-6 p-2 border-2" style={{ borderColor: gridColor }}>
                    <div className="flex justify-between items-end border-b pb-1 mb-2" style={{ borderColor: gridColor }}>
                      <h2 className="text-2xl font-black tracking-widest" style={{ color: gridColor }}>TOPIK 원고지</h2>
                      <div className="flex gap-4 text-[10px] font-bold" style={{ color: gridColor }}>
                        <span>Câu số: [ &nbsp;&nbsp;&nbsp; ]</span>
                        <span>Số chữ: [ &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp; ]</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold" style={{ color: gridColor }}>
                      <div className="flex gap-6">
                        <span>Họ tên: ...........................................</span>
                        <span>SBD: ............................</span>
                      </div>
                      <span className="opacity-60">Trang {pIdx + 1} / {totalPages}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '6mm' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px',
                        borderBottom: '3px solid #444',
                        paddingBottom: '5px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#222',
                        }}
                      >
                        {headerText}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        - {subText}
                      </span>
                      {showMeta && (
                        <div
                          style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '20px',
                            fontSize: '11px',
                            color: '#555',
                            paddingBottom: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span>월</span>
                            <span style={{ display: 'inline-block', width: '40px', borderBottom: '1px solid #888' }}></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span>일</span>
                            <span style={{ display: 'inline-block', width: '40px', borderBottom: '1px solid #888' }}></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span>이름</span>
                            <span style={{ display: 'inline-block', width: '60px', borderBottom: '1px solid #888' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#555',
                        marginTop: '4px',
                      }}
                    >
                      {subText || '문장을 읽으면서 천천히 써 보세요'}
                    </p>
                  </div>
                )
              ) : (
                <div
                  style={{
                    marginBottom: '4mm',
                    borderBottom: '2px solid #888',
                    paddingBottom: '3px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#444',
                    }}
                  >
                    {headerText} - {subText} (tiếp theo)
                  </span>
                  <span style={{ fontSize: '10px', color: '#999' }}>
                    Trang {pIdx + 1}
                  </span>
                </div>
              )}

              {/* ---------- SENTENCE BLOCKS ---------- */}
              <div style={{ flex: 1 }}>
                {pageBlocks.map((block, bIdx) => (
                  <div
                    key={bIdx}
                    className="sentence-block"
                    style={{ marginBottom: `${SEPARATOR_H_MM}mm` }}
                  >
                    {isInterleaved ? (
                      /* --- INTERLEAVED MODE (Line-by-Line) --- */
                      block.charRows.map((row, rIdx) => (
                        <React.Fragment key={`inter-${rIdx}`}>
                          {/* 1. Example Row */}
                          <GridRow
                            chars={row}
                            gridCols={gridCols}
                            cellH={cellH}
                            fontSize={charFontSize}
                            bg={exampleBg}
                            color="#111"
                            fontWeight={800}
                            borderColor={isTopikMode ? gridColor : "#999"}
                            borderStyle={borderStyle}
                            fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                          />
                          {/* 2. Trace Rows for this line */}
                          {Array.from({ length: traceRepeat }).map((_, tIdx) => (
                            <GridRow
                              key={`tr-${rIdx}-${tIdx}`}
                              chars={row}
                              gridCols={gridCols}
                              cellH={cellH}
                              fontSize={charFontSize}
                              bg="#fff"
                              color={getTraceColor(tIdx, traceRepeat)}
                              fontWeight={700}
                              borderColor={isTopikMode ? gridColor : "#bbb"}
                              borderStyle={borderStyle}
                              fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                              showGuides={showGuides}
                            />
                          ))}
                          {/* 3. Empty Rows for this line */}
                          {Array.from({ length: emptyRows }).map((_, eIdx) => (
                            <GridRow
                              key={`em-${rIdx}-${eIdx}`}
                              chars={Array(gridCols).fill('')}
                              gridCols={gridCols}
                              cellH={cellH}
                              fontSize={charFontSize}
                              bg="#fff"
                              color="transparent"
                              fontWeight={400}
                              borderColor={isTopikMode ? gridColor : "#ccc"}
                              borderStyle={borderStyle}
                              fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                              showGuides={showGuides}
                            />
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      /* --- ORIGINAL MODE (Block-by-Block) --- */
                      <>
                        {/* Example rows */}
                        {block.charRows.map((row, rIdx) => (
                          <GridRow
                            key={`ex-${rIdx}`}
                            chars={row}
                            gridCols={gridCols}
                            cellH={cellH}
                            fontSize={charFontSize}
                            bg={exampleBg}
                            color="#111"
                            fontWeight={800}
                            borderColor={isTopikMode ? gridColor : "#999"}
                            borderStyle={borderStyle}
                            fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                          />
                        ))}

                        {/* Trace rows */}
                        {Array.from({ length: traceRepeat }).flatMap((_, tIdx) =>
                          block.charRows.map((row, rIdx) => (
                            <GridRow
                              key={`tr-${tIdx}-${rIdx}`}
                              chars={row}
                              gridCols={gridCols}
                              cellH={cellH}
                              fontSize={charFontSize}
                              bg="#fff"
                              color={getTraceColor(tIdx, traceRepeat)}
                              fontWeight={700}
                              borderColor={isTopikMode ? gridColor : "#bbb"}
                              borderStyle={borderStyle}
                              fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                              showGuides={showGuides}
                            />
                          ))
                        )}

                        {/* Empty practice rows */}
                        {Array.from({ length: emptyRows }).map((_, eIdx) => (
                          <GridRow
                            key={`em-${eIdx}`}
                            chars={Array(gridCols).fill('')}
                            gridCols={gridCols}
                            cellH={cellH}
                            fontSize={charFontSize}
                            bg="#fff"
                            color="transparent"
                            fontWeight={400}
                            borderColor={isTopikMode ? gridColor : "#ccc"}
                            borderStyle={borderStyle}
                            fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                            showGuides={showGuides}
                          />
                        ))}
                      </>
                    )}

                    {/* Dotted separator */}
                    {bIdx < pageBlocks.length - 1 && (
                      <div
                        style={{
                          borderBottom: '1.5px dotted #ccc',
                          margin: `${SEPARATOR_H_MM / 2}mm 0`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ---------- PAGE FOOTER ---------- */}
              {totalPages > 1 && (
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '10px',
                    color: '#aaa',
                    marginTop: 'auto',
                    paddingTop: '2mm',
                  }}
                >
                  Trang {pIdx + 1} / {totalPages}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Expanded Editor Overlay */}
      {isEditorExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div>
                <h3 className="font-bold text-slate-800">Soạn thảo văn bản luyện tập</h3>
                <p className="text-xs text-slate-400">Nhập hoặc dán đoạn văn dài vào đây. Mỗi dòng sẽ là một bài tập viết.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSmartSplit}
                  className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-all border border-amber-100"
                  title="Tách đoạn văn thành các câu riêng biệt dựa trên dấu chấm"
                >
                  ✂️ Tự động tách câu
                </button>
                <button
                  onClick={() => setIsEditorExpanded(false)}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  Xong
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 bg-slate-50">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                className="w-full h-full p-6 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-base text-slate-700 leading-relaxed font-medium shadow-inner"
                placeholder="Dán đoạn văn tiếng Hàn của bạn vào đây...&#10;&#10;Ví dụ:&#10;안녕하세요. (Chào bạn)&#10;만나서 반갑습니다. (Rất vui được gặp bạn)"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between px-6">
              <div className="flex gap-4 text-xs">
                <span className="text-slate-500 font-medium">Tổng ký tự: <b className="text-blue-600">{charStats.total}</b></span>
                <span className="text-slate-500 font-medium">Không bao gồm dấu cách: <b className="text-blue-600">{charStats.noSpaces}</b></span>
              </div>
              <p className="text-xs text-slate-400 italic">
                💡 Mẹo: Nhấn <b>"Tự động tách câu"</b> để tự xuống dòng sau mỗi dấu chấm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
