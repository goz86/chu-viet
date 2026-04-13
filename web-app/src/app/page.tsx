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
] as const;

const BG_COLORS = [
  { label: 'Xanh', value: '#DAEAF6' },
  { label: 'Hồng', value: '#F6DAE4' },
  { label: 'Vàng', value: '#FFF3D1' },
  { label: 'Xám', value: '#E8E8E8' },
  { label: 'Xanh lá', value: '#D6F0D6' },
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
  const renderGuides = showGuides && !ch;

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
            top: '15%',
            bottom: '15%',
            left: '50%',
            width: 0,
            borderLeft: '1px dashed #ccc',
            transform: 'translateX(-0.5px)',
          }} />
          {/* Horizontal center line */}
          <div style={{
            position: 'absolute',
            left: '15%',
            right: '15%',
            top: '50%',
            height: 0,
            borderTop: '1px dashed #ccc',
            transform: 'translateY(-0.5px)',
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
    () =>
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((sentence) => ({
          sentence,
          charRows: sentenceToCharRows(sentence, gridCols),
        })),
    [text, gridCols]
  );

  // ====== PAGINATION ======
  const pages: SentenceBlock[][] = useMemo(() => {
    const calcBlockH = (b: SentenceBlock) => {
      const n = b.charRows.length;
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
  };

  // ====== RENDER ======
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* === Dynamic Print Styles + Google Fonts === */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&family=East+Sea+Dokdo&family=Gaegu:wght@400;700&family=Gamja+Flower&family=Gothic+A1:wght@400;700;800&family=Hi+Melody&family=Jua&family=Nanum+Gothic:wght@400;700;800&family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Pen+Script&family=Poor+Story&display=swap');
        @page { size: A4 ${orientation}; margin: ${MARGIN_MM}mm; }
        @media print {
          .no-print { display: none !important; }
          .worksheet-page {
            padding: 0 !important;
            width: auto !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
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
          {/* --- Text Input --- */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              📝 Văn bản cần luyện
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y text-sm text-slate-700 leading-relaxed"
              style={{ minHeight: '7rem', maxHeight: '50vh' }}
              placeholder="Mỗi dòng là một câu..."
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-400">
                {blocks.length} câu · {totalPages} trang
              </p>
              {maxWrapRows > 2 && (
                <p className="text-xs text-amber-600">
                  ⚠ Câu dài ({longestCharCount} ký tự → {maxWrapRows} hàng)
                </p>
              )}
            </div>
          </div>

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
                  max="20"
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
                  max="5"
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
                Hiện đường dẫn chữ thập (+) trong ô trống
              </label>
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
          <p className="text-xs text-slate-400 text-center mt-2">
            Chọn <strong>&quot;Save as PDF&quot;</strong> trong hộp thoại in
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

        {/* Pages */}
        <div className="flex flex-col items-center p-4 md:p-8 gap-8">
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
              {pIdx === 0 ? (
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
                    문장을 읽으면서 천천히 써 보세요
                  </p>
                </div>
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
                    {/* Example rows (colored background) */}
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
                        borderColor="#999"
                        borderStyle={borderStyle}
                        fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                      />
                    ))}

                    {/* Trace rows (gray text - gradient: darker → lighter) */}
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
                          borderColor="#bbb"
                          borderStyle={borderStyle}
                          fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                        />
                      ))
                    )}

                    {/* Empty practice rows (with optional cross guides) */}
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
                        borderColor="#ccc"
                        borderStyle={borderStyle}
                        fontFamily={`'${selectedFont.value}', ${selectedFont.style}`}
                        showGuides={showGuides}
                      />
                    ))}

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
    </div>
  );
}
