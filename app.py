import streamlit as st
import os
import requests
from fpdf import FPDF
import base64

# --- Configuration & Theme ---
st.set_page_config(
    page_title="Korean Handwriting Practice",
    page_icon="✏️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Theme CSS
st.markdown("""
<style>
    .stApp {
        background-color: #FAFAFC;
    }
    h1 {
        color: #2b3a4a;
        font-family: 'Helvetica Neue', sans-serif;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    [data-testid="stSidebar"] {
        background-color: #ffffff;
        border-right: 1px solid #e0e5eb;
    }
    .stButton>button {
        background-color: #4A90E2;
        color: white;
        border-radius: 8px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #357ABD;
        color: white;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .stTextArea textarea {
        border-radius: 10px;
        border: 1px solid #d1d9e6;
        padding: 15px;
        font-size: 16px;
        background-color: #ffffff;
    }
    .stTextArea textarea:focus {
        border-color: #4A90E2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# --- Font Handling ---
FONT_URL = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf"
FONT_PATH = "NanumGothic-Regular.ttf"
FONT_NAME = "NanumGothic"

@st.cache_resource
def ensure_font_downloaded():
    if not os.path.exists(FONT_PATH):
        try:
            response = requests.get(FONT_URL, timeout=10)
            response.raise_for_status()
            with open(FONT_PATH, "wb") as f:
                f.write(response.content)
            return True, "Font downloaded successfully."
        except Exception as e:
            return False, str(e)
    return True, "Font already exists."

# --- PDF Generator ---
def generate_pdf(text, font_size, grid_height, num_grids, stroke_color_hex):
    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.add_page()
    pdf.add_font(FONT_NAME, style="", fname=FONT_PATH)
    
    # Header
    pdf.set_font(FONT_NAME, size=24)
    pdf.set_text_color(51, 82, 114) 
    pdf.cell(w=0, h=15, text="한국어 쓰기 연습 · Handwriting Practice", ln=1, align="C")
    pdf.ln(10)
    
    sentences = [s.strip() for s in text.split('\n') if s.strip()]
    
    page_width = 210
    margin_left = 15
    margin_right = 15
    stroke_color = tuple(int(stroke_color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    
    for sentence in sentences:
        words = sentence.split()
        for word in words:
            if pdf.get_y() + grid_height + 15 > 297 - 15:
                pdf.add_page()
            
            y_pos = pdf.get_y()
            current_x = margin_left
            
            # --- 1. Draw Target Word ---
            pdf.set_font(FONT_NAME, size=font_size)
            pdf.set_text_color(0, 0, 0)
            target_word_width = pdf.get_string_width(word) + 5
            
            pdf.set_xy(current_x, y_pos)
            pdf.cell(w=target_word_width, h=grid_height, text=word, align="L")
            current_x += target_word_width
            
            # --- 2. Draw Practice Boxes ---
            grid_font_size = font_size * 0.8
            pdf.set_font(FONT_NAME, size=grid_font_size)
            # Set grid box width dynamically so the word actually fits!
            grid_width = max(grid_height, pdf.get_string_width(word) + 4)
            
            # Draw boxes
            pdf.set_draw_color(*stroke_color)
            pdf.set_line_width(0.3)
            
            for i in range(num_grids):
                # If the box would go out of page margins, clip it or break line
                if current_x + grid_width > page_width - margin_right:
                    break # Stop drawing boxes for this word if no space
                
                pdf.rect(x=current_x, y=y_pos, w=grid_width, h=grid_height)
                
                # First 3 grids in light gray
                if i < 3:
                    pdf.set_text_color(210, 210, 210)
                    pdf.set_xy(current_x, y_pos)
                    pdf.cell(w=grid_width, h=grid_height, text=word, align="C")
                
                current_x += grid_width + 2
                
            # --- 3. Example Sentence (Ref) ---
            pdf.set_text_color(120, 120, 120)
            ref_font_size = font_size * 0.5
            pdf.set_font(FONT_NAME, size=ref_font_size)
            pdf.set_xy(current_x + 3, y_pos)
            
            remaining_w = page_width - margin_right - (current_x + 3)
            if remaining_w > 15:
                display_sentence = sentence
                while pdf.get_string_width(display_sentence + "...") > remaining_w and len(display_sentence) > 1:
                    display_sentence = display_sentence[:-1]
                if len(display_sentence) < len(sentence):
                    display_sentence += "..."
                pdf.cell(w=remaining_w, h=grid_height, text=display_sentence, align="L")
            
            pdf.set_y(y_pos + grid_height + 6)
            
        pdf.set_y(pdf.get_y() + 4)
        
    return pdf

# --- Web App ---
def main():
    st.title("✍️ Korean Handwriting Worksheet")
    st.markdown("Tạo PDF luyện viết tiếng Hàn siêu đẹp. Nhập câu của bạn và xem trước ngay bên dưới!")
    
    font_ok, font_msg = ensure_font_downloaded()
    if not font_ok:
        st.error(f"Lỗi tải Font: {font_msg}")
        st.stop()
    
    st.sidebar.header("📝 Cài đặt")
    font_size = st.sidebar.slider("Cỡ chữ", min_value=12, max_value=32, value=20, step=2)
    grid_height = st.sidebar.slider("Chiều cao ô (mm)", min_value=10, max_value=30, value=15, step=1)
    num_grids = st.sidebar.slider("Số lượng ô tập viết", min_value=3, max_value=15, value=8, step=1)
    stroke_color = st.sidebar.color_picker("Màu viền ô", value="#D1D9E6")
    
    default_text = "안녕하세요. 만나서 반갑습니다.\n한국어 쓰기 연습입니다."
    text_input = st.text_area("Nhập văn bản (Mỗi dòng là một câu):", value=default_text, height=150)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        if st.button("✨ Tạo PDF", type="primary"):
            if text_input.strip():
                with st.spinner("Đang tạo bảng tính..."):
                    try:
                        pdf = generate_pdf(text_input, font_size, grid_height, num_grids, stroke_color)
                        pdf_bytes = bytes(pdf.output())
                        
                        st.session_state['pdf_bytes'] = pdf_bytes
                        st.success("✅ Tạo PDF thành công!")
                    except Exception as e:
                        st.error(f"Lỗi khi xử lý: {e}")
            else:
                st.warning("Vui lòng nhập văn bản.")
                
    if 'pdf_bytes' in st.session_state:
        pdf_bytes = st.session_state['pdf_bytes']
        
        with col2:
            st.download_button(
                label="📥 Tải xuống (Download PDF)",
                data=pdf_bytes,
                file_name="Luyen_viet_tieng_Han.pdf",
                mime="application/pdf",
                type="secondary"
            )
        
        st.markdown("### 👀 Bản xem trước (Preview)")
        base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
        pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="700" type="application/pdf"></iframe>'
        st.markdown(pdf_display, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
