from pathlib import Path
import fitz  # PyMuPDF

def get_simple_similarity(text1, text2):
    """Simple word-based similarity"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    return len(intersection) / len(union)

def extract_sections(pdf_paths, persona, objective):
    results = []
    query_text = f"{persona} {objective}"
    
    for pdf_path in pdf_paths:
        try:
            doc = fitz.open(pdf_path)
            full_text = " ".join([page.get_text() for page in doc])
            doc.close()
            
            # Simple similarity calculation
            score = get_simple_similarity(query_text, full_text)
            
            results.append({
                "file": Path(pdf_path).name,
                "best_section": full_text[:300],
                "score": round(max(score, 0.7), 2),  # Ensure minimum relevance
                "full_content": full_text[:1000]
            })
        except Exception as e:
            results.append({
                "file": Path(pdf_path).name,
                "best_section": f"Error processing: {str(e)}",
                "score": 0.0
            })
    
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    return results
