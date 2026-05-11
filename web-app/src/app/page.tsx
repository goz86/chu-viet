'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Circle, Square, Flame, FileText, Layers, Zap, Grid3X3, Palette,
  Eraser, Download, Lightbulb, Eye, Edit3, Scissors,
} from 'lucide-react';

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'vi';
  const nl = navigator.language.toLowerCase();
  if (nl.startsWith('ko')) return 'ko';
  if (nl.startsWith('vi')) return 'vi';
  return 'en';
}

/* ================================================================
   TRANSLATIONS
   ================================================================ */
type Lang = 'vi' | 'ko' | 'en';

const T = {
  vi: {
    appName: 'Luyện chữ Hàn',
    quickSelect: 'Chọn nhanh',
    tabGrid: 'Lưới', tabStyle: 'Kiểu', tabPage: 'Trang',
    colsPerRow: 'Số ô mỗi hàng', cellSize: 'Cỡ ô',
    traceRows: 'Dòng đồ mờ', traceRowsDark: 'Dòng tối đầu',
    emptyRows: 'Dòng trống', emptyRowsExtra: 'Dòng mờ thêm',
    fadeTitle: 'Mờ dần theo dòng',
    fadeDesc: 'Ký tự mờ dần từng dòng — trace → tự viết',
    fadeRows: (n: number) => `${n} dòng: tối → mờ dần → trong suốt`,
    guidesCheck: 'Đường dẫn chữ thập (+)',
    interleavedCheck: 'Chế độ xen kẽ hàng',
    gridLineColor: 'Màu đường kẻ ô',
    clearBtn: 'Tạo trang trắng',
    bgColorLabel: 'Màu nền dòng mẫu',
    borderLabel: 'Kiểu viền ô',
    solidBtn: '── Nét liền', dashedBtn: '- - Nét đứt',
    fontLabel: 'Phông chữ Hàn',
    titleLabel: 'Tiêu đề', subtitleLabel: 'Phụ đề',
    metaCheck: 'Hiện ô 월 / 일 / 이름',
    orientLabel: 'Hướng giấy',
    orientPortrait: 'Dọc', orientLandscape: 'Ngang', orientBooklet: 'Sách A5',
    dlBtn: 'Tải xuống PDF', pageUnit: 'trang',
    printTipTitle: 'Mẹo in chuẩn A4', printTipBooklet: 'Mẹo in sách A5',
    printTip1: 'Lề: None', printTip2: 'Tỷ lệ: 100%',
    printTip3: 'Bật Background Graphics', printTip4: 'Chọn 2 trang/tờ khi in',
    previewTitle: 'Bản xem trước',
    sentUnit: 'câu', fadeBadge: '↓ Mờ dần', liveBadge: '● Live',
    editorTitle: 'Văn bản luyện viết', editorTopik: 'Đề bài / Nội dung viết',
    editorDesc: 'Mỗi dòng là một câu luyện viết',
    splitBtn: 'Tách câu', fullBtn: 'Toàn màn hình',
    charLabel: 'Ký tự', noSpaceLabel: 'Không cách', estimateLabel: 'Dự kiến',
    pdfPagesLabel: 'trang PDF',
    warnTitle: 'Câu quá dài',
    warnBody: (n: number, r: number) => `${n} ký tự sẽ ngắt thành ${r} dòng.`,
    pageContd: 'tiếp theo', pageLbl: 'Trang',
    overlayTitle: 'Soạn thảo', overlayDesc: 'Mỗi dòng là một bài tập viết',
    doneBtn: 'Xong',
    splitHint: 'Nhấn "Tách câu" để tự xuống dòng sau dấu chấm',
    placeholder: 'Nhập câu tiếng Hàn của bạn tại đây...',
    topikPlaceholder: 'Nhập đề bài hoặc nội dung bài luận TOPIK...',
    topikQuestion: 'Câu số', topikWords: 'Số chữ', topikName: 'Họ tên', topikId: 'SBD',
    topikQNumLabel: 'Số câu', topikMaxCharsLabel: 'Giới hạn ký tự', topikWatermarkLabel: 'Số mờ phía sau',
    presets: {
      easy:      { label: 'Dễ',        desc: 'Ô to, nhiều đồ' },
      med:       { label: 'Trung bình', desc: 'Cân bằng' },
      adv:       { label: 'Nâng cao',  desc: 'Ô nhỏ, tự luyện' },
      topik:     { label: 'TOPIK',     desc: 'Giấy thi 원고지' },
      topikFront:{ label: 'TOPIK MT',  desc: 'Mặt trước 51·52·53' },
    },
  },
  ko: {
    appName: '한글 쓰기',
    quickSelect: '빠른 선택',
    tabGrid: '격자', tabStyle: '스타일', tabPage: '페이지',
    colsPerRow: '한 줄 칸 수', cellSize: '칸 크기',
    traceRows: '따라쓰기 줄', traceRowsDark: '진한 첫 줄',
    emptyRows: '빈 줄', emptyRowsExtra: '추가 흐린 줄',
    fadeTitle: '점점 흐려지기',
    fadeDesc: '글자가 줄마다 점점 흐려짐',
    fadeRows: (n: number) => `${n}줄: 진하게 → 점점 흐려짐`,
    guidesCheck: '십자 가이드선 (+)',
    interleavedCheck: '교차 줄 모드',
    gridLineColor: '격자 색상',
    clearBtn: '빈 페이지 만들기',
    bgColorLabel: '예시 줄 배경색',
    borderLabel: '테두리 스타일',
    solidBtn: '── 실선', dashedBtn: '- - 점선',
    fontLabel: '한글 폰트',
    titleLabel: '제목', subtitleLabel: '부제목',
    metaCheck: '월 / 일 / 이름 표시',
    orientLabel: '용지 방향',
    orientPortrait: '세로', orientLandscape: '가로', orientBooklet: 'A5 소책자',
    dlBtn: 'PDF 다운로드', pageUnit: '페이지',
    printTipTitle: 'A4 인쇄 팁', printTipBooklet: 'A5 소책자 팁',
    printTip1: '여백: 없음', printTip2: '크기: 100%',
    printTip3: '배경 그래픽 켜기', printTip4: '"2페이지/장" 선택',
    previewTitle: '미리보기',
    sentUnit: '문장', fadeBadge: '↓ 페이드', liveBadge: '● 라이브',
    editorTitle: '연습 텍스트', editorTopik: '주제 / 쓰기 내용',
    editorDesc: '각 줄이 하나의 연습 문장',
    splitBtn: '문장 분리', fullBtn: '전체화면',
    charLabel: '글자', noSpaceLabel: '공백 제외', estimateLabel: '예상',
    pdfPagesLabel: '페이지 PDF',
    warnTitle: '문장이 너무 길어요',
    warnBody: (n: number, r: number) => `${n}자가 ${r}줄로 나뉩니다.`,
    pageContd: '계속', pageLbl: '페이지',
    overlayTitle: '편집기', overlayDesc: '각 줄이 하나의 연습 문장',
    doneBtn: '완료',
    splitHint: '"문장 분리"를 눌러 마침표 뒤에서 줄 바꿈',
    placeholder: '한국어 문장을 입력하세요...',
    topikPlaceholder: 'TOPIK 쓰기 문제 또는 내용을 입력하세요...',
    topikQuestion: '문제 번호', topikWords: '단어 수', topikName: '이름', topikId: '수험번호',
    topikQNumLabel: '문제 번호', topikMaxCharsLabel: '최대 글자 수', topikWatermarkLabel: '워터마크',
    presets: {
      easy:      { label: '쉬움',   desc: '큰 칸, 따라쓰기' },
      med:       { label: '보통',   desc: '균형' },
      adv:       { label: '고급',   desc: '작은 칸, 자유 쓰기' },
      topik:     { label: 'TOPIK', desc: '원고지 답안지' },
      topikFront:{ label: 'TOPIK 앞', desc: '51·52·53번 답란' },
    },
  },
  en: {
    appName: 'Korean Writing',
    quickSelect: 'Quick Select',
    tabGrid: 'Grid', tabStyle: 'Style', tabPage: 'Page',
    colsPerRow: 'Columns per row', cellSize: 'Cell size',
    traceRows: 'Trace rows', traceRowsDark: 'Dark rows first',
    emptyRows: 'Empty rows', emptyRowsExtra: 'Extra fade rows',
    fadeTitle: 'Gradual fade',
    fadeDesc: 'Characters fade each row — trace → write freely',
    fadeRows: (n: number) => `${n} rows: dark → fading → transparent`,
    guidesCheck: 'Cross guide lines (+)',
    interleavedCheck: 'Interleaved row mode',
    gridLineColor: 'Grid line color',
    clearBtn: 'Create blank page',
    bgColorLabel: 'Example row background',
    borderLabel: 'Cell border style',
    solidBtn: '── Solid', dashedBtn: '- - Dashed',
    fontLabel: 'Korean font',
    titleLabel: 'Title', subtitleLabel: 'Subtitle',
    metaCheck: 'Show 월 / 일 / 이름 fields',
    orientLabel: 'Page orientation',
    orientPortrait: 'Portrait', orientLandscape: 'Landscape', orientBooklet: 'A5 Booklet',
    dlBtn: 'Download PDF', pageUnit: 'pages',
    printTipTitle: 'A4 print tips', printTipBooklet: 'A5 booklet tips',
    printTip1: 'Margins: None', printTip2: 'Scale: 100%',
    printTip3: 'Enable Background Graphics', printTip4: 'Select "2 pages per sheet"',
    previewTitle: 'Preview',
    sentUnit: 'sentences', fadeBadge: '↓ Fade', liveBadge: '● Live',
    editorTitle: 'Practice text', editorTopik: 'Topic / Writing content',
    editorDesc: 'Each line is one practice sentence',
    splitBtn: 'Split', fullBtn: 'Fullscreen',
    charLabel: 'Characters', noSpaceLabel: 'No spaces', estimateLabel: 'Est.',
    pdfPagesLabel: 'page PDF',
    warnTitle: 'Sentence too long',
    warnBody: (n: number, r: number) => `${n} characters will wrap to ${r} rows.`,
    pageContd: 'continued', pageLbl: 'Page',
    overlayTitle: 'Editor', overlayDesc: 'Each line is one writing exercise',
    doneBtn: 'Done',
    splitHint: 'Press "Split" to break lines after punctuation',
    placeholder: 'Enter Korean sentences here...',
    topikPlaceholder: 'Enter TOPIK writing topic or content...',
    topikQuestion: 'Question No.', topikWords: 'Word count', topikName: 'Name', topikId: 'Student ID',
    topikQNumLabel: 'Question No.', topikMaxCharsLabel: 'Max characters', topikWatermarkLabel: 'Watermark',
    presets: {
      easy:      { label: 'Easy',     desc: 'Large cells, guided' },
      med:       { label: 'Medium',   desc: 'Balanced' },
      adv:       { label: 'Advanced', desc: 'Small cells, self-practice' },
      topik:     { label: 'TOPIK',    desc: 'Answer sheet' },
      topikFront:{ label: 'TOPIK Frt',desc: 'Q51·52·53 front' },
    },
  },
};

/* ================================================================
   KOREAN FONTS
   ================================================================ */
const KOREAN_FONTS: Array<{
  label: string; value: string; style: string;
  desc: Record<Lang, string>;
}> = [
  { label: 'Nanum Gothic',   value: 'Nanum Gothic',     style: 'sans-serif',
    desc: { vi: 'Gọn gàng, rõ nét', ko: '깔끔하고 명확한', en: 'Clean, clear' } },
  { label: 'Nanum Myeongjo', value: 'Nanum Myeongjo',   style: 'serif',
    desc: { vi: 'Thanh lịch, có chân', ko: '우아한 명조체', en: 'Elegant serif' } },
  { label: 'Gothic A1',      value: 'Gothic A1',         style: 'sans-serif',
    desc: { vi: 'Hiện đại, sạch', ko: '현대적, 깔끔한', en: 'Modern, clean' } },
  { label: 'Nanum Pen',      value: 'Nanum Pen Script',  style: 'cursive',
    desc: { vi: 'Bút bi viết tay', ko: '볼펜 필기체', en: 'Ballpoint handwriting' } },
  { label: 'Gaegu',          value: 'Gaegu',             style: 'cursive',
    desc: { vi: 'Viết tay học sinh', ko: '학생 필기체', en: 'Student handwriting' } },
  { label: 'Gamja Flower',   value: 'Gamja Flower',      style: 'cursive',
    desc: { vi: 'Viết tay dễ thương', ko: '귀여운 필기체', en: 'Cute handwriting' } },
  { label: 'Hi Melody',      value: 'Hi Melody',         style: 'cursive',
    desc: { vi: 'Ghi chú thoải mái', ko: '편안한 필기', en: 'Casual notes' } },
  { label: 'East Sea Dokdo', value: 'East Sea Dokdo',    style: 'cursive',
    desc: { vi: 'Bút lông nghệ thuật', ko: '예술적 붓글씨', en: 'Artistic brush' } },
  { label: 'Poor Story',     value: 'Poor Story',        style: 'cursive',
    desc: { vi: 'Kể chuyện thân mật', ko: '친근한 이야기체', en: 'Intimate storytelling' } },
  { label: 'Jua',            value: 'Jua',               style: 'sans-serif',
    desc: { vi: 'Tròn, dễ thương', ko: '둥글고 귀여운', en: 'Round, cute' } },
  { label: 'Do Hyeon',       value: 'Do Hyeon',          style: 'sans-serif',
    desc: { vi: 'Đậm, nổi bật', ko: '굵고 눈에 띄는', en: 'Bold, prominent' } },
];

/* ================================================================
   CONSTANTS
   ================================================================ */
const MARGIN_MM        = 15;
const HEADER_H_MM      = 32;
const CONT_HEADER_H_MM = 14;
const SEPARATOR_H_MM   = 5;

type PresetId = 'easy' | 'med' | 'adv' | 'topik' | 'topikFront';
const PRESETS: Array<{ id: PresetId; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; gridCols: number; traceRepeat: number; emptyRows: number }> = [
  { id: 'easy',      icon: Circle,   gridCols: 8,  traceRepeat: 3, emptyRows: 2 },
  { id: 'med',       icon: Square,   gridCols: 12, traceRepeat: 2, emptyRows: 2 },
  { id: 'adv',       icon: Flame,    gridCols: 16, traceRepeat: 1, emptyRows: 3 },
  { id: 'topik',     icon: FileText, gridCols: 10, traceRepeat: 0, emptyRows: 0 },
  { id: 'topikFront',icon: Layers,   gridCols: 25, traceRepeat: 0, emptyRows: 0 },
];

const BG_COLORS = [
  { label: 'Trắng',   value: '#FFFFFF' },
  { label: 'Xanh',    value: '#DAEAF6' },
  { label: 'Hồng',    value: '#F6DAE4' },
  { label: 'Vàng',    value: '#FFF3D1' },
  { label: 'Xám',     value: '#E8E8E8' },
  { label: 'Xanh lá', value: '#D6F0D6' },
];

const GRID_COLORS = [
  { label: 'Xám',     value: '#bbb',    bg: '#bbbbbb' },
  { label: 'Xanh Lá', value: '#228b22', bg: '#228b22' },
  { label: 'Đỏ Cam',  value: '#e67e22', bg: '#e67e22' },
  { label: 'Đen',     value: '#111',    bg: '#111111' },
];

/* ================================================================
   TYPES
   ================================================================ */
interface SentenceBlock { sentence: string; charRows: string[][]; }

type Orientation = 'portrait' | 'landscape' | 'booklet';

/* ================================================================
   HELPERS
   ================================================================ */

/**
 * TOPIK 원고지 tokeniser (실제 시험 규칙 준수)
 *
 * Rules applied:
 *  • Korean / other CJK / symbols : 1 char per cell
 *  • Space                         : 1 empty cell
 *  • ? !                           : 1 cell for the mark + 1 blank cell after
 *  • Capital letter (A-Z)          : 1 per cell
 *  • Lowercase letters (a-z)       : 2 per cell (pair them up)
 *  • Digit sequence (2+ digits)    : 2 per cell
 *  • Single isolated digit         : 1 per cell
 */
function topikTokenize(sentence: string): string[] {
  const chars = [...sentence];   // Unicode-safe split
  const tokens: string[] = [];
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];

    if (ch === ' ') {
      tokens.push('');            // space → empty cell
      i++;
    } else if (ch === '?' || ch === '!') {
      tokens.push(ch);            // punctuation cell
      tokens.push('');            // mandatory blank after ? or !
      i++;
    } else if (/\d/.test(ch)) {
      // 2+ consecutive digits → pair them; lone digit stays alone
      if (i + 1 < chars.length && /\d/.test(chars[i + 1])) {
        tokens.push(ch + chars[i + 1]);
        i += 2;
      } else {
        tokens.push(ch);
        i++;
      }
    } else if (/[A-Z]/.test(ch)) {
      tokens.push(ch);            // uppercase → 1 per cell
      i++;
    } else if (/[a-z]/.test(ch)) {
      // lowercase → 2 per cell
      if (i + 1 < chars.length && /[a-z]/.test(chars[i + 1])) {
        tokens.push(ch + chars[i + 1]);
        i += 2;
      } else {
        tokens.push(ch);          // lone trailing lowercase
        i++;
      }
    } else {
      tokens.push(ch);            // Korean & everything else: 1 per cell
      i++;
    }
  }
  return tokens;
}

function sentenceToCharRows(sentence: string, cols: number): string[][] {
  const tokens = topikTokenize(sentence);
  if (tokens.length === 0) return [Array(cols).fill('')];
  const rows: string[][] = [];
  for (let i = 0; i < tokens.length; i += cols) {
    const row = tokens.slice(i, i + cols);
    while (row.length < cols) row.push('');
    rows.push(row);
  }
  return rows;
}

function getTraceColor(tIdx: number, total: number): string {
  if (total <= 1) return 'rgb(200,200,200)';
  const gray = Math.round(170 + (tIdx / (total - 1)) * 60);
  return `rgb(${gray},${gray},${gray})`;
}

function getGradualFadeColor(idx: number, total: number): string {
  if (total <= 0) return 'transparent';
  const t = idx / Math.max(total - 1, 1);
  const gray = Math.round(155 + t * 100);
  if (gray >= 252) return 'transparent';
  return `rgb(${gray},${gray},${gray})`;
}

/* ================================================================
   CELL
   ================================================================ */
function Cell({ ch, cellH, fontSize, bg, color, fontWeight, borderColor, borderStyle, showGuides }: {
  ch: string; cellH: number; fontSize: number; bg: string; color: string;
  fontWeight: number; borderColor: string; borderStyle: string; showGuides?: boolean;
}) {
  // TOPIK 원고지 rule: 2-char tokens (paired digits / lowercase) shown side-by-side
  // at ~78 % of normal font size so they fit the cell width while still readable
  const isDual = ch.length === 2;
  return (
    <div style={{
      height: `${cellH}mm`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `0.5px ${borderStyle} ${borderColor}`, backgroundColor: bg,
      boxSizing: 'border-box', lineHeight: 1, overflow: 'hidden', position: 'relative',
    }}>
      {showGuides && <>
        <div style={{ position:'absolute', top:'10%', bottom:'10%', left:'50%', width:0, borderLeft:'0.8px dashed rgba(200,200,200,0.6)', transform:'translateX(-0.4px)' }} />
        <div style={{ position:'absolute', left:'10%', right:'10%', top:'50%', height:0, borderTop:'0.8px dashed rgba(200,200,200,0.6)', transform:'translateY(-0.4px)' }} />
      </>}
      {isDual ? (
        /* Two chars side-by-side — numbers/lowercase are narrow so 78% looks natural */
        <span style={{ display:'flex', alignItems:'center', gap:'0.5px', fontSize:`${fontSize * 0.78}mm`, fontWeight, color, lineHeight:1, letterSpacing:0 }}>
          <span>{ch[0]}</span><span>{ch[1]}</span>
        </span>
      ) : (
        <span style={{ fontSize:`${fontSize}mm`, fontWeight, color, lineHeight:1 }}>{ch}</span>
      )}
    </div>
  );
}

/* ================================================================
   GRID ROW
   ================================================================ */
function GridRow({ chars, gridCols, cellH, fontSize, bg, color, fontWeight, borderColor, borderStyle, fontFamily, showGuides }: {
  chars: string[]; gridCols: number; cellH: number; fontSize: number; bg: string; color: string;
  fontWeight: number; borderColor: string; borderStyle: string; fontFamily?: string; showGuides?: boolean;
}) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${gridCols},1fr)`, width:'100%', fontFamily: fontFamily || "'Nanum Gothic',sans-serif" }}>
      {chars.map((ch, i) => <Cell key={i} ch={ch} cellH={cellH} fontSize={fontSize} bg={bg} color={color} fontWeight={fontWeight} borderColor={borderColor} borderStyle={borderStyle} showGuides={showGuides} />)}
    </div>
  );
}

/* ================================================================
   TOPIK ANSWER SHEET COMPONENT
   ================================================================ */
const TOPIK_RANGES: Record<number, [number, number]> = {
  200: [150, 200], 300: [200, 300], 600: [500, 600], 700: [600, 700],
};

function TopikAnswerSheet({ questionNum, maxChars, gridColor, showWatermark }: {
  questionNum: string; maxChars: number; gridColor: string; showWatermark: boolean;
}) {
  // ── Layout constants (real TOPIK 54 exam format) ──────────────────
  // 25 chars per row × 28 rows = 700 cells → each cell ≈ 6.76mm × 7mm (nearly square)
  const COLS      = 25;          // chars per row
  const SECT      = 2;           // rows per section  →  25×2 = 50 chars / section
  const CPS       = COLS * SECT; // 50 chars per section
  const COUNTER_W = 11;          // mm — right counter column width
  const HEADER_H  = 22;          // mm

  const MARGIN    = 15;          // mm page margin (each side)
  const USABLE_H  = 297 - 2 * MARGIN;     // 267mm
  const FOOTER_H  = 10;          // mm
  const GRID_H    = USABLE_H - HEADER_H - FOOTER_H; // 235mm

  const totalRows = maxChars / COLS;        // 28 for 700, 24 for 600, 12 for 300, 8 for 200
  const totalSect = totalRows / SECT;       // 14 for 700
  // Fill the page but cap at 10mm so few-row variants don't get absurdly tall cells
  const CELL_H    = Math.min(GRID_H / totalRows, 10);
  const gridH     = totalRows * CELL_H;    // actual grid height (≤235mm)
  const outerH    = HEADER_H + gridH;      // total boxed area height

  const gc  = gridColor === '#bbb' ? '#111' : gridColor;
  const ib  = 'rgba(0,0,0,0.18)';   // light inner cell border
  const sb  = 'rgba(0,0,0,0.55)';   // darker section-divider border
  const [minC, maxC] = TOPIK_RANGES[maxChars] ?? [maxChars - 100, maxChars];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Be Vietnam Pro','Nanum Gothic',sans-serif" }}>

      {/* ── HEADER + GRID — single outer border so no double-border gap ── */}
      <div style={{
        height: `${outerH}mm`, flexShrink: 0,
        border: `1.5px solid ${gc}`,
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box', overflow: 'hidden',
      }}>

        {/* Header row */}
        <div style={{ display: 'flex', borderBottom: `1.5px solid ${gc}`, flexShrink: 0 }}>
          {/* Question number */}
          <div style={{ width: '18mm', flexShrink: 0, borderRight: `1.5px solid ${gc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2mm 1mm' }}>
            <span style={{ fontSize: '8.5mm', fontWeight: 900, color: gc, lineHeight: 1 }}>{questionNum || '54'}</span>
          </div>
          {/* Title + instruction */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5mm 3mm', borderBottom: `1px solid ${gc}`, display: 'flex', alignItems: 'center', gap: '4mm' }}>
              <span style={{ fontSize: '3.8mm', fontWeight: 700, letterSpacing: '1.5mm', color: gc, whiteSpace: 'nowrap' }}>주 관 식   답 란</span>
              <span style={{ fontSize: '3.5mm', color: gc }}>(Answer sheet for composition)</span>
            </div>
            <div style={{ padding: '1mm 3mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.8mm', fontWeight: 600, color: gc, lineHeight: 1.4 }}>
                아래 빈칸에 {minC}자에서 {maxC}자 이내로 작문하시오 (띄어쓰기 포함).
              </span>
              <span style={{ fontSize: '2.3mm', color: '#444', lineHeight: 1.3 }}>
                (Please write your answer below; your answer must be between {minC} and {maxC} letters including spaces.)
              </span>
            </div>
          </div>
        </div>

        {/* Grid area */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

          {/* Watermark */}
          {showWatermark && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
              <span style={{ fontSize: `${Math.min(gridH * 0.45, 90)}mm`, fontWeight: 900, color: 'rgba(0,0,0,0.04)', lineHeight: 1, userSelect: 'none', display: 'block' }}>
                {questionNum || '54'}
              </span>
            </div>
          )}

          {/* Writing cells — 25 cols × totalRows rows */}
          <div style={{ flex: 1, zIndex: 1, borderRight: `1px solid ${gc}` }}>
            {Array.from({ length: totalRows }).map((_, r) => {
              const isSect = (r + 1) % SECT === 0;
              const isLast = r === totalRows - 1;
              return (
                <div key={r} style={{
                  display: 'flex',
                  height: `${CELL_H}mm`,
                  boxSizing: 'border-box',
                  borderBottom: isLast ? 'none'
                    : isSect ? `1.2px solid ${sb}`
                    : `0.5px solid ${ib}`,
                }}>
                  {Array.from({ length: COLS }).map((_, c) => {
                    // Bold vertical divider every 5 columns (at col 5, 10, 15, 20)
                    const isVert5  = (c + 1) % 5 === 0 && c < COLS - 1;
                    // Even bolder at every 10 columns (at col 10, 20)
                    const isVert10 = (c + 1) % 10 === 0 && c < COLS - 1;
                    return (
                      <div key={c} style={{
                        flex: 1,
                        boxSizing: 'border-box',
                        borderRight: c >= COLS - 1 ? 'none'
                          : isVert10 ? `1.5px solid ${sb}`
                          : isVert5  ? `1px solid rgba(0,0,0,0.38)`
                          : `0.5px solid ${ib}`,
                      }} />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Counter column — shows cumulative char count at each section boundary */}
          <div style={{ width: `${COUNTER_W}mm`, flexShrink: 0, zIndex: 1, borderLeft: `1px solid ${gc}` }}>
            {Array.from({ length: totalSect }).map((_, s) => (
              <div key={s} style={{
                height: `${SECT * CELL_H}mm`,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                borderBottom: s < totalSect - 1 ? `1.2px solid ${sb}` : 'none',
                paddingBottom: '0.8mm',
                fontSize: '2.8mm',
                color: gc,
                boxSizing: 'border-box',
              }}>
                {(s + 1) * CPS}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ paddingTop: '3mm' }}>
        <p style={{ fontSize: '2.5mm', color: gc, margin: 0, lineHeight: 1.5 }}>※ 주어진 답란의 방향을 바꿔서 답안을 쓰면 &apos;0&apos;점 처리됩니다.</p>
        <p style={{ fontSize: '2.3mm', color: '#555', margin: 0, lineHeight: 1.4 }}>(Please do not turn the answer sheet horizontally. No points will be given.)</p>
      </div>
    </div>
  );
}

/* ================================================================
   TOPIK FRONT SHEET  (Q51 + Q52 + Q53 — front side of exam paper)
   ================================================================ */
function TopikFrontSheet({ gridColor }: { gridColor: string }) {
  const gc  = gridColor === '#bbb' ? '#111' : gridColor;
  const OMR = '#dc0069';          // magenta OMR timing marks
  const ib  = 'rgba(0,0,0,0.18)';
  const sb  = 'rgba(0,0,0,0.55)';

  // Q53 grid — 25 cols × 12 rows = 300 chars
  const COLS      = 25;
  const SECT      = 2;
  const CPS       = COLS * SECT;    // 50 chars per counter section
  const Q53_ROWS  = 12;
  const Q53_SECTS = Q53_ROWS / SECT;  // 6
  const COUNTER_W = 11;             // mm

  // Fixed heights for each zone
  const OMR_H    = 6;   // mm
  const WARN_H   = 11;  // mm
  const Q51_H    = 25;  // mm
  const Q52_H    = 25;  // mm
  const Q53_HDR_H = 16; // mm
  const FOOT_H   = 9;   // mm

  const MARGIN    = 15;
  const USABLE_H  = 297 - 2 * MARGIN;  // 267mm

  // Cell width ≈ (180mm − 11mm counter) / 25 cols ≈ 6.76mm
  // → use 7mm height → aspect ratio 7/6.76 ≈ 1.04 (essentially square)
  const Q53_CELL_H = 7;   // mm per row

  // Inline helper so it can close over gc/ib constants
  const renderShortAnswer = (num: string, bottomBorder: string) => (
    <div style={{ height:`${num === '51' ? Q51_H : Q52_H}mm`, flexShrink:0, borderBottom:bottomBorder, display:'flex', boxSizing:'border-box' }}>
      <div style={{ width:'18mm', flexShrink:0, borderRight:`1.5px solid ${gc}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'7mm', fontWeight:900, color:gc, lineHeight:1 }}>{num}</span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ flex:1, display:'flex', alignItems:'flex-end', padding:'0 4mm', paddingBottom:'2.5mm', borderBottom:`0.5px solid rgba(0,0,0,0.18)`, boxSizing:'border-box' }}>
          <span style={{ fontSize:'3.2mm', color:gc, marginRight:'2mm', lineHeight:1 }}>①</span>
          <div style={{ flex:1, borderBottom:`0.8px solid ${gc}` }} />
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'flex-end', padding:'0 4mm', paddingBottom:'2.5mm', boxSizing:'border-box' }}>
          <span style={{ fontSize:'3.2mm', color:gc, marginRight:'2mm', lineHeight:1 }}>②</span>
          <div style={{ flex:1, borderBottom:`0.8px solid ${gc}` }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:`${USABLE_H}mm`, fontFamily:"'Be Vietnam Pro','Nanum Gothic',sans-serif" }}>

      {/* ── OMR timing marks ── */}
      <div style={{ height:`${OMR_H}mm`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:'0.5mm' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ width:'5mm', height:'4.5mm', background:OMR }} />
        ))}
      </div>

      {/* ── Main bordered box — auto height, determined by content ── */}
      <div style={{
        flexShrink:0,
        border:`1.5px solid ${gc}`, boxSizing:'border-box',
        display:'flex', flexDirection:'column',
      }}>

        {/* Warning notice */}
        <div style={{ height:`${WARN_H}mm`, flexShrink:0, borderBottom:`1px solid ${gc}`, display:'flex', alignItems:'center', padding:'0 4mm', boxSizing:'border-box' }}>
          <span style={{ fontSize:'2.6mm', color:gc, lineHeight:1.5 }}>
            ※ 주관식 답안은 정해진 답란을 벗어나거나 답란을 바꿔 쓸 경우 점수를 받을 수 없습니다.
          </span>
        </div>

        {/* Q51 */}
        {renderShortAnswer('51', `1px solid rgba(0,0,0,0.3)`)}

        {/* Q52 */}
        {renderShortAnswer('52', `1.5px solid ${gc}`)}

        {/* Q53 header */}
        <div style={{ height:`${Q53_HDR_H}mm`, flexShrink:0, borderBottom:`1px solid ${gc}`, display:'flex', boxSizing:'border-box' }}>
          <div style={{ width:'18mm', flexShrink:0, borderRight:`1.5px solid ${gc}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'7mm', fontWeight:900, color:gc, lineHeight:1 }}>53</span>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'1mm 3mm' }}>
            <div style={{ fontSize:'3.5mm', fontWeight:700, letterSpacing:'1mm', color:gc }}>주 관 식   답 란</div>
            <div style={{ fontSize:'2.5mm', color:gc, marginTop:'1mm' }}>아래 빈칸에 200자에서 300자 이내로 작문하시오 (띄어쓰기 포함).</div>
            <div style={{ fontSize:'2mm', color:'#555', marginTop:'0.5mm' }}>(Please write your answer below; 200–300 letters including spaces.)</div>
          </div>
        </div>

        {/* Q53 grid — fixed 7mm rows → cells ≈ square (width ≈ 6.76mm) */}
        <div style={{ flexShrink:0, display:'flex' }}>

          {/* Writing cells — 25 cols × 12 rows */}
          <div style={{ flex:1, borderRight:`1px solid ${gc}` }}>
            {Array.from({ length: Q53_ROWS }).map((_, r) => {
              const isSect = (r + 1) % SECT === 0;
              const isLast = r === Q53_ROWS - 1;
              return (
                <div key={r} style={{
                  display:'flex', height:`${Q53_CELL_H}mm`, boxSizing:'border-box',
                  borderBottom: isLast ? 'none' : isSect ? `1.2px solid ${sb}` : `0.5px solid ${ib}`,
                }}>
                  {Array.from({ length: COLS }).map((_, c) => {
                    const isVert5  = (c + 1) % 5  === 0 && c < COLS - 1;
                    const isVert10 = (c + 1) % 10 === 0 && c < COLS - 1;
                    return (
                      <div key={c} style={{
                        flex:1, boxSizing:'border-box',
                        borderRight: c >= COLS - 1 ? 'none'
                          : isVert10 ? `1.5px solid ${sb}`
                          : isVert5  ? `1px solid rgba(0,0,0,0.38)`
                          : `0.5px solid ${ib}`,
                      }} />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Character counter column — each section = SECT × Q53_CELL_H */}
          <div style={{ width:`${COUNTER_W}mm`, flexShrink:0 }}>
            {Array.from({ length: Q53_SECTS }).map((_, s) => (
              <div key={s} style={{
                height:`${Q53_CELL_H * SECT}mm`, boxSizing:'border-box',
                display:'flex', alignItems:'flex-end', justifyContent:'center',
                borderBottom: s < Q53_SECTS - 1 ? `1.2px solid ${sb}` : 'none',
                paddingBottom:'0.8mm', fontSize:'2.8mm', color:gc,
              }}>
                {(s + 1) * CPS}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Spacer — pushes footer to page bottom ── */}
      <div style={{ flex:1 }} />

      {/* ── Footer ── */}
      <div style={{ height:`${FOOT_H}mm`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'3.2mm', fontWeight:700, color:gc }}>54번은 뒷면에 작성하시오.</span>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Home() {
  /* ── language ── */
  const [lang, setLang] = useState<Lang>('vi');
  useEffect(() => { setLang(detectLang()); }, []);
  const t = T[lang];

  /* ── text ── */
  const [text, setText] = useState('꽃이 피었습니다.\n새싹이 돋았습니다.\n바람이 붑니다.\n시냇물이 흘러갑니다.');

  /* ── grid ── */
  const [gridCols,    setGridCols]    = useState(12);
  const [traceRepeat, setTraceRepeat] = useState(1);
  const [emptyRows,   setEmptyRows]   = useState(2);
  const [gradualFade, setGradualFade] = useState(false);
  const [showGuides,  setShowGuides]  = useState(true);
  const [isInterleaved, setIsInterleaved] = useState(false);
  const [gridColor,   setGridColor]   = useState('#bbb');

  /* ── style ── */
  const [exampleBg,   setExampleBg]   = useState('#DAEAF6');
  const [borderStyle, setBorderStyle] = useState<'solid'|'dashed'>('solid');
  const [selectedFont,setSelectedFont]= useState(KOREAN_FONTS[0]);

  /* ── page ── */
  const [headerText,  setHeaderText]  = useState('한글공부');
  const [subText,     setSubText]     = useState('문장쓰기');
  const [showMeta,    setShowMeta]    = useState(true);
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  /* ── topik ── */
  const [topikQuestionNum,   setTopikQuestionNum]   = useState('54');
  const [topikMaxChars,      setTopikMaxChars]      = useState(700);
  const [topikWatermark,     setTopikWatermark]     = useState(true);

  /* ── ui ── */
  const [activePreset,       setActivePreset]       = useState<PresetId>('med');
  const [activeTab,          setActiveTab]          = useState<'grid'|'style'|'page'>('grid');
  const [isEditorExpanded,   setIsEditorExpanded]   = useState(false);
  const [isTopikMode,        setIsTopikMode]        = useState(false);
  const [isTopikFrontMode,   setIsTopikFrontMode]   = useState(false);

  /* ── derived ── */
  const charStats = useMemo(() => {
    const raw = text.replace(/\n/g, '');
    return { total: raw.length, noSpaces: raw.replace(/\s/g, '').length };
  }, [text]);

  const pageW   = orientation === 'landscape' ? 297 : orientation === 'booklet' ? 148.5 : 210;
  const pageH   = orientation === 'landscape' ? 210 : orientation === 'booklet' ? 210   : 297;
  const usableW = pageW  - 2 * MARGIN_MM;
  const usableH = pageH  - 2 * MARGIN_MM;
  const cellW   = usableW / gridCols;
  const cellH   = cellW;
  const charFontSize = cellH * 0.55;

  const blocks = useMemo<SentenceBlock[]>(() => {
    const b = text.split('\n').map(s => s.trim()).filter(Boolean)
      .map(sentence => ({ sentence, charRows: sentenceToCharRows(sentence, gridCols) }));
    if (b.length === 0 && (isTopikMode || isTopikFrontMode)) return [{ sentence: '', charRows: [] }];
    return b;
  }, [text, gridCols, isTopikMode, isTopikFrontMode]);

  const pages = useMemo<SentenceBlock[][]>(() => {
    const calcBlockH = (b: SentenceBlock) => {
      const n = b.charRows.length;
      if (isInterleaved || gradualFade) {
        return n * (1 + traceRepeat + emptyRows) * cellH + SEPARATOR_H_MM;
      }
      return (n + n * traceRepeat + emptyRows) * cellH + SEPARATOR_H_MM;
    };
    const result: SentenceBlock[][] = [];
    let page: SentenceBlock[] = [];
    let used = HEADER_H_MM;
    for (const block of blocks) {
      const bh = calcBlockH(block);
      if (used + bh > usableH && page.length > 0) { result.push(page); page = []; used = CONT_HEADER_H_MM; }
      page.push(block);
      used += bh;
    }
    if (page.length > 0) result.push(page);
    if (result.length === 0) result.push([]);
    return result;
  }, [blocks, traceRepeat, emptyRows, cellH, usableH, isInterleaved, gradualFade]);

  const totalPages = pages.length;

  const longestCharCount = useMemo(() => blocks.reduce((m, b) => Math.max(m, [...b.sentence].length), 0), [blocks]);
  const maxWrapRows = Math.ceil(longestCharCount / gridCols);

  /* ── handlers ── */
  const applyPreset = (p: typeof PRESETS[number]) => {
    setActivePreset(p.id);
    setGridCols(p.gridCols);
    setTraceRepeat(p.traceRepeat);
    setEmptyRows(p.emptyRows);
    setExampleBg('#DAEAF6');
    if (p.id === 'topik') {
      setIsTopikMode(true); setIsTopikFrontMode(false);
      setGridColor('#111'); setShowGuides(false);
      setIsInterleaved(false); setGradualFade(false);
    } else if (p.id === 'topikFront') {
      setIsTopikFrontMode(true); setIsTopikMode(false);
      setGridColor('#111'); setShowGuides(false);
      setIsInterleaved(false); setGradualFade(false);
    } else {
      setIsTopikMode(false); setIsTopikFrontMode(false);
      setGridColor('#bbb'); setShowGuides(true);
    }
  };

  const handleSmartSplit = () => {
    if (!text.trim()) return;
    setText(text.replace(/([.?!])\s*/g, '$1\n').split('\n').map(s => s.trim()).filter(Boolean).join('\n'));
  };

  /* ── shared micro-styles ── */
  const ghostPill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '9999px',
    border: '1px solid var(--primary)', background: 'transparent',
    color: 'var(--primary)', fontSize: '14px', letterSpacing: '-0.224px',
    cursor: 'pointer', transition: 'transform 0.15s ease', fontFamily: 'inherit',
  };
  const sd = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(0.95)'; };
  const su = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1)'; };

  /* ── tab definitions ── */
  const TABS = [
    { id: 'grid'  as const, icon: Grid3X3, label: t.tabGrid },
    { id: 'style' as const, icon: Palette, label: t.tabStyle },
    { id: 'page'  as const, icon: FileText, label: t.tabPage },
  ];

  /* ── font for worksheet ── */
  const wsFontFamily = `'${selectedFont.value}', ${selectedFont.style}`;

  /* ── render helper: practice rows ── */
  const renderPracticeRows = (row: string[], keyPrefix: string) => {
    const total = traceRepeat + emptyRows;
    if (gradualFade) {
      return Array.from({ length: total }).map((_, idx) => (
        <GridRow key={`${keyPrefix}-gf-${idx}`} chars={row} gridCols={gridCols} cellH={cellH}
          fontSize={charFontSize} bg="#fff" color={getGradualFadeColor(idx, total)}
          fontWeight={700} borderColor={isTopikMode ? gridColor : idx < traceRepeat ? '#bbb' : '#ccc'}
          borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
      ));
    }
    return [
      ...Array.from({ length: traceRepeat }).map((_, tIdx) => (
        <GridRow key={`${keyPrefix}-tr-${tIdx}`} chars={row} gridCols={gridCols} cellH={cellH}
          fontSize={charFontSize} bg="#fff" color={getTraceColor(tIdx, traceRepeat)}
          fontWeight={700} borderColor={isTopikMode ? gridColor : '#bbb'}
          borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
      )),
      ...Array.from({ length: emptyRows }).map((_, eIdx) => (
        <GridRow key={`${keyPrefix}-em-${eIdx}`} chars={Array(gridCols).fill('')} gridCols={gridCols} cellH={cellH}
          fontSize={charFontSize} bg="#fff" color="transparent"
          fontWeight={400} borderColor={isTopikMode ? gridColor : '#ccc'}
          borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
      )),
    ];
  };

  /* ── page size label for @page CSS ── */
  const isAnyTopik = isTopikMode || isTopikFrontMode;
  const atPageSize = isAnyTopik ? 'A4 portrait' : orientation === 'booklet' ? 'A5 portrait' : `A4 ${orientation}`;
  const printPageW = isAnyTopik ? 210 : pageW;
  const printPageH = isAnyTopik ? 297 : pageH;

  /* ── render a single worksheet page ── */
  const renderWorksheetPage = (pageBlocks: SentenceBlock[], pIdx: number) => (
    <div key={pIdx} className="worksheet-page bg-white relative"
      style={{ width:`${pageW}mm`, minHeight:`${pageH}mm`, padding:`${MARGIN_MM}mm`, boxSizing:'border-box', fontFamily:`'Be Vietnam Pro','Nanum Gothic',sans-serif`, display:'flex', flexDirection:'column' }}>

      {/* PAGE HEADER */}
      {pIdx === 0 ? (
        isTopikMode ? (
          <div className="flex flex-col mb-6 p-2 border-2" style={{ borderColor:gridColor }}>
            <div className="flex justify-between items-end border-b pb-1 mb-2" style={{ borderColor:gridColor }}>
              <h2 className="text-2xl font-black tracking-widest" style={{ color:gridColor }}>TOPIK 원고지</h2>
              <div className="flex gap-4 text-[11px] font-black" style={{ color:gridColor }}>
                <span>{t.topikQuestion}: [ &nbsp;&nbsp; ]</span><span>{t.topikWords}: [ &nbsp;&nbsp;/&nbsp;&nbsp; ]</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-black" style={{ color:gridColor }}>
              <div className="flex gap-6">
                <span>{t.topikName}: ..........................................</span>
                <span>{t.topikId}: ....................</span>
              </div>
              <span className="opacity-80">{t.pageLbl} {pIdx+1}/{totalPages}</span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom:'6mm' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px', borderBottom:'3px solid #444', paddingBottom:'5px' }}>
              <span style={{ fontSize:'22px', fontWeight:900, color:'#020617' }}>{headerText}</span>
              <span style={{ fontSize:'13px', fontWeight:800, color:'#475569' }}>- {subText}</span>
              {showMeta && (
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'flex-end', gap:'20px', fontSize:'11px', color:'#555', paddingBottom:'2px' }}>
                  {['월','일','이름'].map((l, i) => (
                    <div key={l} style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                      <span>{l}</span>
                      <span style={{ display:'inline-block', width: i===2?'60px':'40px', borderBottom:'1px solid #888' }}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize:'11px', color:'#555', marginTop:'4px' }}>{subText||'문장을 읽으면서 천천히 써 보세요'}</p>
          </div>
        )
      ) : (
        <div style={{ marginBottom:'4mm', borderBottom:'2px solid #888', paddingBottom:'3px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#444' }}>{headerText} - {subText} ({t.pageContd})</span>
          <span style={{ fontSize:'10px', color:'#999' }}>{t.pageLbl} {pIdx+1}</span>
        </div>
      )}

      {/* SENTENCE BLOCKS */}
      <div style={{ flex:1 }}>
        {pageBlocks.map((block, bIdx) => (
          <div key={bIdx} className="sentence-block" style={{ marginBottom:`${SEPARATOR_H_MM}mm` }}>
            {isInterleaved ? (
              block.charRows.map((row, rIdx) => (
                <React.Fragment key={`inter-${rIdx}`}>
                  <GridRow chars={row} gridCols={gridCols} cellH={cellH} fontSize={charFontSize}
                    bg={exampleBg} color="#111" fontWeight={800}
                    borderColor={isTopikMode ? gridColor : '#999'}
                    borderStyle={borderStyle} fontFamily={wsFontFamily} />
                  {renderPracticeRows(row, `inter-${rIdx}`)}
                </React.Fragment>
              ))
            ) : (
              <>
                {block.charRows.map((row, rIdx) => (
                  <GridRow key={`ex-${rIdx}`} chars={row} gridCols={gridCols} cellH={cellH}
                    fontSize={charFontSize} bg={exampleBg} color="#111" fontWeight={800}
                    borderColor={isTopikMode ? gridColor : '#999'}
                    borderStyle={borderStyle} fontFamily={wsFontFamily} />
                ))}
                {gradualFade
                  ? Array.from({ length: traceRepeat + emptyRows }).flatMap((_, idx) =>
                      block.charRows.map((row, rIdx) => (
                        <GridRow key={`gf-${idx}-${rIdx}`} chars={row} gridCols={gridCols} cellH={cellH}
                          fontSize={charFontSize} bg="#fff"
                          color={getGradualFadeColor(idx, traceRepeat + emptyRows)}
                          fontWeight={700}
                          borderColor={isTopikMode ? gridColor : idx < traceRepeat ? '#bbb' : '#ccc'}
                          borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
                      ))
                    )
                  : <>
                      {Array.from({ length: traceRepeat }).flatMap((_, tIdx) =>
                        block.charRows.map((row, rIdx) => (
                          <GridRow key={`tr-${tIdx}-${rIdx}`} chars={row} gridCols={gridCols} cellH={cellH}
                            fontSize={charFontSize} bg="#fff"
                            color={getTraceColor(tIdx, traceRepeat)}
                            fontWeight={700}
                            borderColor={isTopikMode ? gridColor : '#bbb'}
                            borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
                        ))
                      )}
                      {Array.from({ length: emptyRows }).map((_, eIdx) => (
                        <GridRow key={`em-${eIdx}`} chars={Array(gridCols).fill('')} gridCols={gridCols} cellH={cellH}
                          fontSize={charFontSize} bg="#fff" color="transparent" fontWeight={400}
                          borderColor={isTopikMode ? gridColor : '#ccc'}
                          borderStyle={borderStyle} fontFamily={wsFontFamily} showGuides={showGuides} />
                      ))}
                    </>
                }
              </>
            )}
            {bIdx < pageBlocks.length - 1 && (
              <div style={{ borderBottom:'1.5px dotted #ccc', margin:`${SEPARATOR_H_MM/2}mm 0` }} />
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ textAlign:'right', fontSize:'10px', color:'#aaa', marginTop:'auto', paddingTop:'2mm' }}>
          {t.pageLbl} {pIdx+1} / {totalPages}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="app-root min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--canvas-parchment)' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&family=East+Sea+Dokdo&family=Gaegu:wght@400;700&family=Gamja+Flower&family=Gothic+A1:wght@400;700;800&family=Hi+Melody&family=Jua&family=Nanum+Gothic:wght@400;700;800&family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Pen+Script&family=Poor+Story&display=swap');
        @page { size: ${atPageSize}; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          html, body, main { height: auto !important; overflow: visible !important; background: white !important; }
          .app-root { min-height: 0 !important; display: block !important; }
          .print-container { display: block !important; padding: 0 !important; margin: 0 !important; gap: 0 !important; overflow: visible !important; }
          .pages-scroll-wrap { padding: 0 !important; margin: 0 !important; overflow: visible !important; max-width: none !important; width: auto !important; }
          .pages-flex-wrap { display: block !important; padding: 0 !important; margin: 0 !important; gap: 0 !important; width: auto !important; max-width: none !important; }
          .worksheet-page {
            width: ${printPageW}mm !important; height: ${printPageH}mm !important;
            padding: ${MARGIN_MM}mm !important; box-shadow: none !important;
            border: none !important; margin: 0 !important;
            page-break-after: always; position: relative !important; top: 0 !important; left: 0 !important;
          }
          .worksheet-page:last-child { page-break-after: auto; }
          .sentence-block { page-break-inside: avoid; }
        }
      `}</style>

      {/* ════════════════════════ SIDEBAR ════════════════════════ */}
      <aside className="no-print w-full md:w-[300px] flex flex-col shrink-0 md:h-screen md:sticky md:top-0"
        style={{ background: 'var(--canvas)', borderRight: '1px solid var(--hairline)' }}>

        {/* ── Global Nav (44px black) ── */}
        <nav style={{ background:'var(--surface-black)', height:'44px', display:'flex', alignItems:'center', padding:'0 14px', gap:'8px', flexShrink:0 }}>
          <img src="/logo.png" alt="Logo" style={{ width:'22px', height:'22px', borderRadius:'6px', objectFit:'cover' }} />
          <span style={{ color:'var(--on-dark)', fontSize:'12px', fontWeight:400, letterSpacing:'-0.12px', flex:1 }}>{t.appName}</span>
          {/* Language toggle */}
          <div style={{ display:'flex', gap:'3px' }}>
            {(['vi','ko','en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{
                  padding:'3px 7px', borderRadius:'5px', border:'none',
                  background: lang === l ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: lang === l ? 'white' : 'rgba(255,255,255,0.45)',
                  fontSize:'11px', fontWeight: lang === l ? 600 : 400,
                  cursor:'pointer', transition:'all 0.15s ease', fontFamily:'inherit',
                  letterSpacing:'0.02em',
                }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Preset Strip (parchment) ── */}
        <div style={{ background:'var(--canvas-parchment)', borderBottom:'1px solid var(--hairline)', padding:'10px 14px', flexShrink:0 }}>
          <p style={{ fontSize:'10px', fontWeight:600, color:'var(--ink-muted-48)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px', display:'flex', alignItems:'center', gap:'4px' }}>
            <Zap size={11} /> {t.quickSelect}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px' }}>
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => applyPreset(p)} title={t.presets[p.id].desc}
                onMouseDown={sd} onMouseUp={su} onMouseLeave={su}
                style={{
                  background:'var(--canvas)',
                  border: activePreset === p.id ? '2px solid var(--primary-focus)' : '1px solid var(--hairline)',
                  borderRadius:'10px', padding:'8px 4px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
                  cursor:'pointer', transition:'border-color 0.15s ease, transform 0.15s ease', fontFamily:'inherit',
                }}>
                <p.icon size={16}
                  color={activePreset === p.id ? 'var(--primary)' : 'var(--ink-muted-48)'}
                  strokeWidth={activePreset === p.id ? 2.5 : 2} />
                <span style={{ fontSize:'10px', lineHeight:1, fontWeight: activePreset === p.id ? 600 : 400, color: activePreset === p.id ? 'var(--primary)' : 'var(--ink)', letterSpacing:'-0.12px' }}>
                  {t.presets[p.id].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--hairline)', flexShrink:0, background:'var(--canvas)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex:1, padding:'10px 6px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                border:'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                background:'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--ink-muted-48)',
                fontSize:'11px', fontWeight: activeTab === tab.id ? 600 : 400,
                cursor:'pointer', transition:'all 0.15s ease', fontFamily:'inherit',
              }}>
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto light-scrollbar" style={{ background:'var(--canvas)' }}>

          {/* ─── TAB 1: GRID ─── */}
          {activeTab === 'grid' && isTopikFrontMode && (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'18px' }}>
              <p style={{ fontSize:'13px', color:'var(--ink-muted-48)', lineHeight:1.6 }}>
                TOPIK II 앞면 — 51·52·53번 답란
              </p>
              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'9px' }}>{t.gridLineColor}</p>
                <div style={{ display:'flex', gap:'10px' }}>
                  {GRID_COLORS.map(c => (
                    <button key={c.value} onClick={() => setGridColor(c.value)} title={c.label} style={{
                      width:'28px', height:'28px', borderRadius:'50%', backgroundColor:c.bg,
                      border: gridColor === c.value ? '2.5px solid var(--primary-focus)' : '2.5px solid var(--divider-soft)',
                      transform: gridColor === c.value ? 'scale(1.15)' : 'scale(1)',
                      transition:'all 0.15s ease', cursor:'pointer',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'grid' && isTopikMode && !isTopikFrontMode && (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'18px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', display:'block', marginBottom:'8px' }}>{t.topikQNumLabel}</label>
                <input type="text" value={topikQuestionNum} onChange={e => setTopikQuestionNum(e.target.value)}
                  style={{ width:'100%', padding:'8px 14px', borderRadius:'9999px', border:'1px solid var(--hairline)', background:'var(--canvas)', color:'var(--ink)', fontSize:'14px', letterSpacing:'-0.224px', outline:'none', transition:'border-color 0.15s ease', fontFamily:'inherit' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; }} />
              </div>
              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'9px' }}>{t.topikMaxCharsLabel}</p>
                <div style={{ display:'flex', gap:'6px' }}>
                  {[200, 300, 600, 700].map(n => (
                    <button key={n} onClick={() => setTopikMaxChars(n)} style={{
                      flex:1, padding:'8px 2px', borderRadius:'9999px', fontFamily:'inherit',
                      border:'1px solid var(--hairline)',
                      background: topikMaxChars === n ? 'var(--primary)' : 'var(--canvas)',
                      color: topikMaxChars === n ? 'white' : 'var(--ink)',
                      fontSize:'13px', fontWeight: topikMaxChars === n ? 600 : 400,
                      cursor:'pointer', transition:'all 0.15s ease',
                    }}>{n}</button>
                  ))}
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color:'var(--ink)', letterSpacing:'-0.224px' }}>
                <input type="checkbox" checked={topikWatermark} onChange={e => setTopikWatermark(e.target.checked)} className="apple-checkbox" />
                {t.topikWatermarkLabel}
              </label>
              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'9px' }}>{t.gridLineColor}</p>
                <div style={{ display:'flex', gap:'10px' }}>
                  {GRID_COLORS.map(c => (
                    <button key={c.value} onClick={() => setGridColor(c.value)} title={c.label} style={{
                      width:'28px', height:'28px', borderRadius:'50%', backgroundColor:c.bg,
                      border: gridColor === c.value ? '2.5px solid var(--primary-focus)' : '2.5px solid var(--divider-soft)',
                      transform: gridColor === c.value ? 'scale(1.15)' : 'scale(1)',
                      transition:'all 0.15s ease', cursor:'pointer',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grid' && !isTopikMode && !isTopikFrontMode && (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'18px' }}>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                  <span style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px' }}>{t.colsPerRow}</span>
                  <span style={{ fontSize:'17px', fontWeight:600, color:'var(--primary)', letterSpacing:'-0.374px', lineHeight:1 }}>{gridCols}</span>
                </div>
                <input type="range" min="6" max="25" value={gridCols} onChange={e => setGridCols(+e.target.value)} className="apple-slider" />
                <p style={{ fontSize:'11px', color:'var(--ink-muted-48)', marginTop:'5px' }}>{t.cellSize}: {cellW.toFixed(1)}mm × {cellH.toFixed(1)}mm</p>
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                  <span style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px' }}>
                    {gradualFade ? t.traceRowsDark : t.traceRows}
                  </span>
                  <span style={{ fontSize:'17px', fontWeight:600, color:'var(--primary)', letterSpacing:'-0.374px', lineHeight:1 }}>{traceRepeat}</span>
                </div>
                <input type="range" min="0" max="5" value={traceRepeat} onChange={e => setTraceRepeat(+e.target.value)} className="apple-slider" />
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                  <span style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px' }}>
                    {gradualFade ? t.emptyRowsExtra : t.emptyRows}
                  </span>
                  <span style={{ fontSize:'17px', fontWeight:600, color:'var(--primary)', letterSpacing:'-0.374px', lineHeight:1 }}>{emptyRows}</span>
                </div>
                <input type="range" min="0" max="50" value={emptyRows} onChange={e => setEmptyRows(+e.target.value)} className="apple-slider" />
              </div>

              {/* ── Gradual Fade Toggle ── */}
              <div style={{ padding:'12px 14px', borderRadius:'11px', background:'var(--canvas-parchment)', border:'1px solid var(--divider-soft)' }}>
                <label style={{ display:'flex', alignItems:'flex-start', gap:'10px', cursor:'pointer' }}>
                  <input type="checkbox" checked={gradualFade} disabled={isTopikMode}
                    onChange={e => setGradualFade(e.target.checked)} className="apple-checkbox" style={{ marginTop:'2px' }} />
                  <div>
                    <span style={{ fontSize:'14px', fontWeight:600, color: isTopikMode ? 'var(--ink-muted-48)' : 'var(--ink)', letterSpacing:'-0.224px', display:'block' }}>
                      {t.fadeTitle}
                    </span>
                    <span style={{ fontSize:'11px', color:'var(--ink-muted-48)', marginTop:'3px', display:'block', lineHeight:1.5 }}>
                      {gradualFade ? t.fadeRows(traceRepeat + emptyRows) : t.fadeDesc}
                    </span>
                  </div>
                </label>
                {gradualFade && (
                  <div style={{ display:'flex', gap:'3px', marginTop:'10px', paddingTop:'8px', borderTop:'1px solid var(--divider-soft)', alignItems:'center' }}>
                    {Array.from({ length: Math.min(traceRepeat + emptyRows, 7) }).map((_, i) => {
                      const total = Math.min(traceRepeat + emptyRows, 7);
                      const gray = Math.round(155 + (i / Math.max(total - 1, 1)) * 100);
                      return (
                        <div key={i} style={{
                          width:'22px', height:'22px', borderRadius:'5px',
                          background: gray >= 252 ? 'var(--divider-soft)' : `rgb(${gray},${gray},${gray})`,
                          border:'1px solid var(--hairline)', flexShrink:0,
                        }} />
                      );
                    })}
                    {traceRepeat + emptyRows > 7 && <span style={{ fontSize:'11px', color:'var(--ink-muted-48)' }}>+{traceRepeat + emptyRows - 7}</span>}
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color:'var(--ink)', letterSpacing:'-0.224px' }}>
                  <input type="checkbox" checked={showGuides} onChange={e => setShowGuides(e.target.checked)} className="apple-checkbox" />
                  {t.guidesCheck}
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color:'var(--ink)', letterSpacing:'-0.224px' }}>
                  <input type="checkbox" checked={isInterleaved} onChange={e => setIsInterleaved(e.target.checked)} className="apple-checkbox" />
                  {t.interleavedCheck}
                </label>
              </div>

              {/* Grid line color */}
              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'9px' }}>{t.gridLineColor}</p>
                <div style={{ display:'flex', gap:'10px' }}>
                  {GRID_COLORS.map(c => (
                    <button key={c.value} onClick={() => setGridColor(c.value)} title={c.label} style={{
                      width:'28px', height:'28px', borderRadius:'50%', backgroundColor:c.bg,
                      border: gridColor === c.value ? '2.5px solid var(--primary-focus)' : '2.5px solid var(--divider-soft)',
                      transform: gridColor === c.value ? 'scale(1.15)' : 'scale(1)',
                      transition:'all 0.15s ease', cursor:'pointer',
                    }} />
                  ))}
                </div>
              </div>

              {/* Clear button */}
              <button onClick={() => { setText(''); setEmptyRows(20); setTraceRepeat(0); }}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                  padding:'8px 14px', borderRadius:'11px', border:'1px solid var(--hairline)',
                  background:'var(--canvas)', color:'var(--ink-muted-80)',
                  fontSize:'14px', letterSpacing:'-0.224px', cursor:'pointer',
                  transition:'background 0.15s ease', fontFamily:'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-parchment)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas)'; }}>
                <Eraser size={14} /> {t.clearBtn}
              </button>
            </div>
          )}

          {/* ─── TAB 2: STYLE ─── */}
          {activeTab === 'style' && (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'20px' }}>

              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'10px' }}>{t.bgColorLabel}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                  {BG_COLORS.map(c => (
                    <button key={c.value} onClick={() => setExampleBg(c.value)} title={c.label} style={{
                      width:'28px', height:'28px', borderRadius:'50%', backgroundColor:c.value,
                      border: exampleBg === c.value ? '2.5px solid var(--primary-focus)' : '2.5px solid var(--divider-soft)',
                      transform: exampleBg === c.value ? 'scale(1.15)' : 'scale(1)',
                      transition:'all 0.15s ease', cursor:'pointer',
                    }} />
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'10px' }}>{t.borderLabel}</p>
                <div style={{ display:'flex', gap:'8px' }}>
                  {(['solid','dashed'] as const).map(s => (
                    <button key={s} onClick={() => setBorderStyle(s)} style={{
                      flex:1, padding:'8px 0', borderRadius:'9999px', fontFamily:'inherit',
                      border: '1px solid var(--hairline)',
                      background: borderStyle === s ? 'var(--primary)' : 'var(--canvas)',
                      color: borderStyle === s ? 'white' : 'var(--ink)',
                      fontSize:'13px', fontWeight: borderStyle === s ? 600 : 400,
                      cursor:'pointer', transition:'all 0.15s ease',
                    }}>
                      {s === 'solid' ? t.solidBtn : t.dashedBtn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'10px' }}>{t.fontLabel}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {KOREAN_FONTS.map(f => (
                    <button key={f.value} onClick={() => setSelectedFont(f)} style={{
                      display:'flex', flexDirection:'column', alignItems:'flex-start',
                      padding:'10px 14px', borderRadius:'11px', textAlign:'left',
                      border: selectedFont.value === f.value ? '2px solid var(--primary-focus)' : '1px solid var(--hairline)',
                      background:'var(--canvas)', cursor:'pointer',
                      transition:'border-color 0.15s ease', fontFamily:'inherit',
                    }}>
                      <span style={{ fontFamily:`'${f.value}',${f.style}`, fontSize:'15px', fontWeight:700, color:'var(--ink)', lineHeight:1.3 }}>
                        한글 가나다 — {f.label}
                      </span>
                      <span style={{ fontSize:'11px', color:'var(--ink-muted-48)', marginTop:'2px' }}>{f.desc[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: PAGE ─── */}
          {activeTab === 'page' && (
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'16px' }}>

              <div>
                <label style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', display:'block', marginBottom:'8px' }}>{t.titleLabel}</label>
                <input type="text" value={headerText} onChange={e => setHeaderText(e.target.value)}
                  style={{ width:'100%', padding:'8px 14px', borderRadius:'9999px', border:'1px solid var(--hairline)', background:'var(--canvas)', color:'var(--ink)', fontSize:'14px', letterSpacing:'-0.224px', outline:'none', transition:'border-color 0.15s ease', fontFamily:'inherit' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; }} />
              </div>

              <div>
                <label style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', display:'block', marginBottom:'8px' }}>{t.subtitleLabel}</label>
                <input type="text" value={subText} onChange={e => setSubText(e.target.value)}
                  style={{ width:'100%', padding:'8px 14px', borderRadius:'9999px', border:'1px solid var(--hairline)', background:'var(--canvas)', color:'var(--ink)', fontSize:'14px', letterSpacing:'-0.224px', outline:'none', transition:'border-color 0.15s ease', fontFamily:'inherit' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; }} />
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color:'var(--ink)', letterSpacing:'-0.224px' }}>
                <input type="checkbox" checked={showMeta} onChange={e => setShowMeta(e.target.checked)} className="apple-checkbox" />
                {t.metaCheck}
              </label>

              <div>
                <p style={{ fontSize:'12px', color:'var(--ink-muted-48)', letterSpacing:'-0.12px', marginBottom:'10px' }}>{t.orientLabel}</p>
                <div style={{ display:'flex', gap:'6px' }}>
                  {(['portrait','landscape','booklet'] as const).map(o => (
                    <button key={o} onClick={() => setOrientation(o)} style={{
                      flex:1, padding:'8px 2px', borderRadius:'9999px', fontFamily:'inherit',
                      border:'1px solid var(--hairline)',
                      background: orientation === o ? 'var(--primary)' : 'var(--canvas)',
                      color: orientation === o ? 'white' : 'var(--ink)',
                      fontSize:'12px', fontWeight: orientation === o ? 600 : 400,
                      cursor:'pointer', transition:'all 0.15s ease', whiteSpace:'nowrap',
                    }}>
                      {o === 'portrait' ? t.orientPortrait : o === 'landscape' ? t.orientLandscape : t.orientBooklet}
                    </button>
                  ))}
                </div>
                {orientation === 'booklet' && (
                  <p style={{ fontSize:'11px', color:'var(--ink-muted-48)', marginTop:'7px', lineHeight:1.5 }}>
                    A5 (148.5 × 210mm) · {t.printTip4}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Download Footer ── */}
        <div style={{ padding:'14px', borderTop:'1px solid var(--hairline)', background:'var(--canvas)', flexShrink:0 }}>
          <button type="button" className="btn-primary"
            onClick={e => { e.preventDefault(); setTimeout(() => window.print(), 100); }}>
            <Download size={16} />
            {t.dlBtn} ({totalPages} {t.pageUnit})
          </button>
          <div style={{ marginTop:'10px', padding:'11px 13px', borderRadius:'11px', background:'var(--canvas-parchment)', border:'1px solid var(--divider-soft)' }}>
            <p style={{ fontSize:'11px', fontWeight:600, color:'var(--ink)', marginBottom:'5px', display:'flex', alignItems:'center', gap:'5px' }}>
              <Lightbulb size={11} /> {orientation === 'booklet' ? t.printTipBooklet : t.printTipTitle}
            </p>
            <ul style={{ fontSize:'10px', color:'var(--ink-muted-48)', listStyle:'disc', paddingLeft:'14px', lineHeight:1.8 }}>
              <li>{t.printTip1}</li>
              <li>{t.printTip2}</li>
              <li>{t.printTip3}</li>
              {orientation === 'booklet' && <li style={{ fontWeight:600, color:'var(--ink)' }}>{t.printTip4}</li>}
            </ul>
          </div>
        </div>
      </aside>

      {/* ════════════════════════ MAIN ════════════════════════ */}
      <main className="flex-1 overflow-y-auto overflow-x-auto" style={{ background:'var(--canvas-parchment)' }}>

        {/* Sub-nav frosted toolbar */}
        <div className="no-print subnav-frosted sticky top-0 z-10"
          style={{ height:'52px', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'21px', fontWeight:600, color:'var(--ink)', letterSpacing:'0.231px', lineHeight:1.19 }}>
            {t.previewTitle}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {gradualFade && (
              <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(0,102,204,0.08)', color:'var(--primary)', padding:'3px 9px', borderRadius:'9999px', border:'1px solid rgba(0,102,204,0.15)' }}>
                {t.fadeBadge}
              </span>
            )}
            {orientation === 'booklet' && (
              <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(0,102,204,0.08)', color:'var(--primary)', padding:'3px 9px', borderRadius:'9999px', border:'1px solid rgba(0,102,204,0.15)' }}>
                A5
              </span>
            )}
            <span style={{ fontSize:'13px', color:'var(--ink-muted-48)', letterSpacing:'-0.224px' }}>
              {blocks.length} {t.sentUnit} · {totalPages} {t.pageUnit}
            </span>
            <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(52,199,89,0.1)', color:'#1a7f37', padding:'3px 9px', borderRadius:'9999px', border:'1px solid rgba(52,199,89,0.2)' }}>
              {t.liveBadge}
            </span>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex flex-col items-center p-4 md:p-8 gap-8 print-container w-full overflow-hidden">

          {/* Editor Card */}
          <div className="no-print w-full min-w-[320px] max-w-[210mm] animate-fade-in-up md:min-w-[0]">
            <div style={{ background:'var(--canvas)', border:'1px solid var(--hairline)', borderRadius:'18px', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--divider-soft)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
                <div>
                  <h3 style={{ fontSize:'17px', fontWeight:600, color:'var(--ink)', letterSpacing:'-0.374px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <Edit3 size={15} color="var(--ink-muted-48)" />
                    {isTopikMode ? t.editorTopik : t.editorTitle}
                  </h3>
                  <p style={{ fontSize:'13px', color:'var(--ink-muted-48)', marginTop:'3px', letterSpacing:'-0.224px' }}>
                    {t.editorDesc}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <button onClick={handleSmartSplit} style={ghostPill} onMouseDown={sd} onMouseUp={su} onMouseLeave={su}>
                    <Scissors size={12} /> {t.splitBtn}
                  </button>
                  <button onClick={() => setIsEditorExpanded(true)} style={ghostPill} onMouseDown={sd} onMouseUp={su} onMouseLeave={su}>
                    <Eye size={12} /> {t.fullBtn}
                  </button>
                </div>
              </div>
              <div style={{ padding:'16px 18px' }}>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  style={{ width:'100%', minHeight:'110px', padding:'12px', borderRadius:'11px', border:'1px solid var(--hairline)', background:'var(--canvas-parchment)', color:'var(--ink)', fontSize:'17px', letterSpacing:'-0.374px', lineHeight:1.47, fontFamily:'inherit', outline:'none', resize:'vertical', transition:'border-color 0.15s ease' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; }}
                  placeholder={isTopikMode ? t.topikPlaceholder : t.placeholder} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px' }}>
                  <div style={{ display:'flex', gap:'16px' }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'5px' }}>
                      <span style={{ fontSize:'10px', color:'var(--ink-muted-48)', textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:600 }}>{t.charLabel}</span>
                      <span style={{ fontSize:'21px', fontWeight:600, color:'var(--primary)', lineHeight:1, letterSpacing:'-0.374px' }}>{charStats.total}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'5px' }}>
                      <span style={{ fontSize:'10px', color:'var(--ink-muted-48)', textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:600 }}>{t.noSpaceLabel}</span>
                      <span style={{ fontSize:'21px', fontWeight:600, color:'var(--ink)', lineHeight:1, letterSpacing:'-0.374px' }}>{charStats.noSpaces}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:'10px', color:'var(--ink-muted-48)', textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:600 }}>{t.estimateLabel}</p>
                    <p style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', letterSpacing:'-0.224px' }}>{totalPages} {t.pdfPagesLabel}</p>
                  </div>
                </div>
                {maxWrapRows > 2 && !isTopikMode && (
                  <div style={{ marginTop:'10px', padding:'10px 12px', borderRadius:'11px', background:'#fffbeb', border:'1px solid #fde68a', display:'flex', alignItems:'flex-start', gap:'8px' }}>
                    <span>⚠</span>
                    <p style={{ fontSize:'13px', color:'#92400e', lineHeight:1.5 }}>
                      <b>{t.warnTitle}:</b> {t.warnBody(longestCharCount, maxWrapRows)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="pages-scroll-wrap w-full max-w-[100vw] overflow-x-auto pb-4">
            <div className="pages-flex-wrap flex flex-col items-start sm:items-center gap-8 w-max mx-auto px-4 sm:px-0">
              {isTopikFrontMode ? (
                <div className="worksheet-page bg-white"
                  style={{ width:'210mm', height:'297mm', padding:`${MARGIN_MM}mm`, boxSizing:'border-box', display:'flex', flexDirection:'column' }}>
                  <TopikFrontSheet gridColor={gridColor} />
                </div>
              ) : isTopikMode ? (
                <div className="worksheet-page bg-white"
                  style={{ width:'210mm', minHeight:'297mm', padding:`${MARGIN_MM}mm`, boxSizing:'border-box', display:'flex', flexDirection:'column' }}>
                  <TopikAnswerSheet
                    questionNum={topikQuestionNum}
                    maxChars={topikMaxChars}
                    gridColor={gridColor}
                    showWatermark={topikWatermark}
                  />
                </div>
              ) : orientation === 'booklet'
                ? Array.from({ length: Math.ceil(pages.length / 2) }).map((_, spreadIdx) => (
                    <div key={spreadIdx} style={{ display:'flex', gap:0, borderRadius:'4px', overflow:'hidden', boxShadow:'rgba(0,0,0,0.22) 3px 5px 30px 0' }}>
                      {[0,1].map(offset => {
                        const pIdx = spreadIdx * 2 + offset;
                        return pIdx < pages.length
                          ? <React.Fragment key={offset}>{renderWorksheetPage(pages[pIdx], pIdx)}</React.Fragment>
                          : <div key={offset} style={{ width:`${pageW}mm`, minHeight:`${pageH}mm`, background:'white' }} />;
                      })}
                    </div>
                  ))
                : pages.map((pageBlocks, pIdx) => renderWorksheetPage(pageBlocks, pIdx))
              }
            </div>
          </div>
        </div>
      </main>

      {/* ════════ EXPANDED EDITOR OVERLAY ════════ */}
      {isEditorExpanded && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div style={{ background:'var(--canvas)', width:'100%', maxWidth:'896px', height:'80vh', borderRadius:'18px', boxShadow:'rgba(0,0,0,0.22) 3px 5px 30px', display:'flex', flexDirection:'column', overflow:'hidden' }} className="animate-fade-in">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--divider-soft)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <h3 style={{ fontSize:'17px', fontWeight:600, color:'var(--ink)', letterSpacing:'-0.374px' }}>{t.overlayTitle}</h3>
                <p style={{ fontSize:'13px', color:'var(--ink-muted-48)', letterSpacing:'-0.224px', marginTop:'2px' }}>{t.overlayDesc}</p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={handleSmartSplit} style={ghostPill} onMouseDown={sd} onMouseUp={su} onMouseLeave={su}>
                  <Scissors size={12} /> {t.splitBtn}
                </button>
                <button onClick={() => setIsEditorExpanded(false)}
                  style={{ padding:'8px 20px', borderRadius:'9999px', border:'none', background:'var(--primary)', color:'white', fontSize:'14px', letterSpacing:'-0.224px', cursor:'pointer', transition:'transform 0.15s ease', fontFamily:'inherit' }}
                  onMouseDown={sd} onMouseUp={su} onMouseLeave={su}>
                  {t.doneBtn}
                </button>
              </div>
            </div>
            <div style={{ flex:1, padding:'16px', background:'var(--canvas-parchment)' }}>
              <textarea value={text} onChange={e => setText(e.target.value)} autoFocus
                style={{ width:'100%', height:'100%', padding:'16px', borderRadius:'11px', border:'1px solid var(--hairline)', background:'var(--canvas)', color:'var(--ink)', fontSize:'17px', letterSpacing:'-0.374px', lineHeight:1.47, fontFamily:'inherit', outline:'none', resize:'none', transition:'border-color 0.15s ease' }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary-focus)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; }} />
            </div>
            <div style={{ padding:'10px 18px', borderTop:'1px solid var(--divider-soft)', background:'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:'14px', fontSize:'14px', color:'var(--ink-muted-48)', letterSpacing:'-0.224px' }}>
                <span>{t.charLabel}: <b style={{ color:'var(--primary)' }}>{charStats.total}</b></span>
                <span>{t.noSpaceLabel}: <b style={{ color:'var(--primary)' }}>{charStats.noSpaces}</b></span>
              </div>
              <p style={{ fontSize:'11px', color:'var(--ink-muted-48)', fontStyle:'italic' }}>{t.splitHint}</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MOBILE FAB ════════ */}
      <div className="md:hidden no-print" style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:100 }}>
        <button type="button" title={t.dlBtn}
          onClick={e => { e.preventDefault(); setTimeout(() => window.print(), 100); }}
          onMouseDown={sd} onMouseUp={su} onMouseLeave={su}
          style={{ width:'44px', height:'44px', background:'var(--primary)', color:'white', borderRadius:'9999px', border:'none', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'rgba(0,0,0,0.22) 3px 5px 30px', cursor:'pointer', transition:'transform 0.15s ease' }}>
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
