import fitz  # PyMuPDF
import re, json, unicodedata
from collections import defaultdict, Counter
from pathlib import Path


def detect_script(text):
    scripts = {'DEVANAGARI': 0, 'CJK': 0, 'LATIN': 0}
    for ch in text:
        if 'ऀ' <= ch <= 'ॿ':
            scripts['DEVANAGARI'] += 1
        elif '぀' <= ch <= 'ヿ' or '一' <= ch <= '鿿':
            scripts['CJK'] += 1
        elif 'LATIN' in unicodedata.name(ch, ''):
            scripts['LATIN'] += 1
    return max(scripts, key=scripts.get)


def is_likely_heading(text):
    """Enhanced filtering for actual headings"""
    text = text.strip()
    
    # Length constraints
    if len(text) < 3 or len(text) > 120:
        return False
    
    # Skip common non-heading patterns
    skip_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # Dates
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',
        r'\bpage\s*\d+\b',  # Page references
        r'^\d+\s*of\s*\d+$',
        r'^(figure|table|appendix|annex)\s*\d+',
        r'^\(.*\)$',  # Parentheses
        r'^version\s+\d+(\.\d+)*$',  # Version numbers alone
        r'^\d+%$',  # Percentages
        r'^\$\d+',  # Money
        r'^[A-Z]{2,}\s*:',  # Acronyms with colons
        r'(https?://|www\.|@|\.(com|org|net|pdf))',  # URLs/emails
        r'^[\d\s\-\.,:;]+$',  # Only numbers and punctuation
    ]
    
    for pattern in skip_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return False
    
    # Must contain meaningful text
    if not re.search(r'[a-zA-Z\u0900-\u097F\u4e00-\u9fff]', text):
        return False
    
    # Skip if too many numbers
    if len(re.findall(r'\d+', text)) > 3:
        return False
    
    return True


def is_toc_related(text):
    """Check if text is table of contents related"""
    toc_patterns = [
        r'^table\s+of\s+contents?$',
        r'^contents?$',
        r'^toc$'
    ]
    for pattern in toc_patterns:
        if re.match(pattern, text, re.IGNORECASE):
            return True
    return False


def extract_visual_title(doc):
    """Extract document title with better criteria"""
    page = doc[0]
    blocks = page.get_text("dict")["blocks"]
    candidates = []
    
    for b in blocks:
        if "lines" not in b:
            continue
        for line in b["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                size = round(span["size"], 1)
                x, y = span["bbox"][0], span["bbox"][1]
                
                if not text or len(text) < 5 or len(text) > 100:
                    continue
                
                if not is_likely_heading(text):
                    continue
                
                # Skip version numbers as titles
                if re.match(r'^version\s+\d+', text, re.IGNORECASE):
                    continue
                
                score = 0
                if size >= 18: score += 5
                elif size >= 16: score += 4
                elif size >= 14: score += 2
                
                if "Bold" in span["font"]: score += 3
                if y < 120: score += 4  # Very top of page
                if 50 < x < 400: score += 1
                
                word_count = len(text.split())
                if 3 <= word_count <= 10: score += 3
                if text.istitle(): score += 2
                
                candidates.append((score, text))
    
    if candidates:
        candidates.sort(reverse=True)
        return candidates[0][1]
    return "Untitled Document"


def toc_to_json(doc, toc, title):
    """Convert TOC to JSON with proper filtering and sorting"""
    outline = []
    for level, text, page_num in toc:
        if level > 3:
            continue
        
        cleaned_text = text.strip()
        if is_likely_heading(cleaned_text) and not is_toc_related(cleaned_text):
            outline.append({
                "level": f"H{level}", 
                "text": cleaned_text, 
                "page": max(0, page_num - 1)
            })
    
    # Sort by page number
    outline.sort(key=lambda x: x["page"])
    return {"title": title, "outline": outline}


def score_span(span, body_size, script):
    """Enhanced scoring with stricter criteria"""
    text = span["text"].strip()
    
    if not is_likely_heading(text):
        return 0
    
    # Skip TOC-related headings
    if is_toc_related(text):
        return 0
    
    score = 0
    size = round(span["size"], 1)
    fontname = span["font"]
    x_pos, y_pos = span["bbox"][0], span["bbox"][1]
    flags = span.get("flags", 0)
    
    # Size scoring
    diff = size - body_size
    if diff >= 8: score += 8
    elif diff >= 6: score += 6
    elif diff >= 4: score += 4
    elif diff >= 2: score += 2
    elif diff > 0: score += 1
    else: return 0
    
    # Font weight
    if script == "LATIN":
        if flags & 4: score += 4
        if "Bold" in fontname: score += 4
    else:
        if diff >= 2: score += 3
    
    # Position scoring
    if y_pos < 80: score += 4
    elif y_pos < 150: score += 2
    
    if 50 < x_pos < 400: score += 1
    
    # Text characteristics
    word_count = len(text.split())
    if 2 <= word_count <= 8: score += 3
    elif word_count <= 12: score += 1
    else: score -= 2
    
    # Heading patterns
    if re.match(r'^\d+(\.\d+)*\s+\w+', text): score += 5
    if text.isupper() and len(text) > 3: score += 2
    if text.istitle(): score += 1
    
    return score


def assign_levels(headings):
    """Improved level assignment with proper sorting"""
    if not headings:
        return []
    
    result = []
    used_texts = set()
    
    # First, sort by page number, then by position on page
    headings.sort(key=lambda x: (x["page"], x["y"]))
    
    for h in headings:
        text = h["text"].strip()
        
        # Skip duplicates
        text_key = text.lower()
        if text_key in used_texts:
            continue
        used_texts.add(text_key)
        
        # Determine level
        level = "H3"  # default
        
        # Pattern-based level assignment
        if re.match(r'^\d+\.\d+\.\d+', text):
            level = "H3"
        elif re.match(r'^\d+\.\d+', text):
            level = "H2"
        elif re.match(r'^\d+(\s|\.)', text):
            level = "H1"
        else:
            # Score-based assignment
            if h["score"] >= 12: level = "H1"
            elif h["score"] >= 8: level = "H2"
            else: level = "H3"
        
        result.append({
            "level": level, 
            "text": text, 
            "page": h["page"]
        })
    
    return result


def smart_heading_extraction(doc, title):
    """Main extraction with improved filtering and organization"""
    size_counter = defaultdict(int)
    
    # Determine body text size more accurately
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if "lines" not in b: continue
            for line in b["lines"]:
                for span in line["spans"]:
                    size = round(span["size"], 1)
                    font = span["font"]
                    text = span["text"].strip()
                    
                    # Count regular paragraph text only
                    if (len(text) > 30 and 
                        "Bold" not in font and 
                        span.get("flags", 0) & 4 == 0 and
                        not re.match(r'^\d+(\.\d+)*\s', text) and
                        span["bbox"][1] > 100):  # Not in header area
                        size_counter[size] += len(text)
    
    body_size = max(size_counter.items(), key=lambda x: x[1])[0] if size_counter else 12
    
    headings = []
    
    for page_num, page in enumerate(doc):
        page_candidates = []
        
        for b in page.get_text("dict")["blocks"]:
            if "lines" not in b: continue
            for line in b["lines"]:
                for span in line["spans"]:
                    text = re.sub(r'\s+', ' ', span["text"].strip())
                    
                    if not text or len(text) < 3:
                        continue
                    
                    if not is_likely_heading(text):
                        continue
                    
                    script = detect_script(text)
                    score = score_span(span, body_size, script)
                    
                    if score >= 7:  # Higher threshold
                        page_candidates.append({
                            "text": text, "page": page_num, "score": score,
                            "font": span["font"], "size": span["size"],
                            "x": span["bbox"][0], "y": span["bbox"][1],
                            "flags": span.get("flags", 0), "script": script
                        })
        
        # Limit per page and sort by position
        page_candidates.sort(key=lambda x: (x["y"], -x["score"]))
        headings.extend(page_candidates[:6])  # Max 6 per page
    
    # Filter out very common repeated text
    text_counts = Counter([h["text"].lower() for h in headings])
    filtered = [h for h in headings if text_counts[h["text"].lower()] <= 2]
    
    outline = assign_levels(filtered)
    
    # Final sort by page number
    outline.sort(key=lambda x: x["page"])
    
    return {"title": title, "outline": outline}


# [Include all your existing functions from process_pdfs.py here]
# detect_script, is_likely_heading, extract_visual_title, etc.

def extract_outline_from_pdf(pdf_path):
    """Main function with error handling"""
    try:
        doc = fitz.open(pdf_path)
        title = doc.metadata.get("title", "").strip() or extract_visual_title(doc)
        toc = doc.get_toc()
        
        if toc and len(toc) > 2:
            return toc_to_json(doc, toc, title)
        else:
            return smart_heading_extraction(doc, title)
            
    except Exception as e:
        return {"title": "Error Processing PDF", "outline": [], "error": str(e)}
    finally:
        if 'doc' in locals():
            doc.close()

# [Include all other functions from your process_pdfs.py]


def process_pdfs():
    """Process all PDFs in input directory"""
    input_dir = Path("/app/input")
    output_dir = Path("/app/output")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for pdf_path in input_dir.glob("*.pdf"):
        result = extract_outline_from_pdf(str(pdf_path))
        output_file = output_dir / f"{pdf_path.stem}.json"
        
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    process_pdfs()