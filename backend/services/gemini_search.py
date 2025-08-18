import fitz  # PyMuPDF
import google.generativeai as genai
import faiss
import numpy as np
import os
from typing import List, Dict, Any

class GeminiSearchService:
    def __init__(self, api_key: str):
        """Initialize the Gemini search service with API key"""
        genai.configure(api_key=api_key)
        self.pdf_texts = []
        self.embeddings = []
        self.index = None
        self.is_indexed = False
        
    def extract_text_from_pdfs(self, pdf_paths: List[str]) -> List[Dict[str, Any]]:
        """Extract text from all PDFs and store with metadata"""
        self.pdf_texts = []
        
        for pdf_path in pdf_paths:
            try:
                doc = fitz.open(pdf_path)
                for page_num in range(len(doc)):
                    text = doc[page_num].get_text()
                    if text.strip():
                        self.pdf_texts.append({
                            "pdf": os.path.basename(pdf_path),
                            "pdf_path": pdf_path,
                            "page": page_num + 1,
                            "text": text
                        })
                doc.close()
            except Exception as e:
                print(f"Error processing {pdf_path}: {e}")
                continue
                
        print(f"✅ Extracted {len(self.pdf_texts)} pages from {len(pdf_paths)} PDFs")
        return self.pdf_texts
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for text using Gemini API"""
        try:
            res = genai.embed_content(model="models/embedding-001", content=text)
            return np.array(res["embedding"], dtype="float32")
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return zero vector as fallback
            return np.zeros(768, dtype="float32")
    
    def build_index(self) -> bool:
        """Build FAISS index from extracted text embeddings"""
        if not self.pdf_texts:
            print("❌ No PDF texts available. Extract text first.")
            return False
            
        try:
            # Get embeddings for all pages
            print("🔄 Getting embeddings...")
            self.embeddings = [self.get_embedding(item["text"]) for item in self.pdf_texts]
            embedding_matrix = np.vstack(self.embeddings)
            
            # Store in FAISS index
            dim = embedding_matrix.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            faiss.normalize_L2(embedding_matrix)
            self.index.add(embedding_matrix)
            
            self.is_indexed = True
            print("✅ FAISS index built successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error building index: {e}")
            return False
    
    def search_related(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for related content using the query"""
        if not self.is_indexed or not self.index:
            print("❌ Index not built. Build index first.")
            return []
            
        try:
            # Get query embedding
            q_vec = self.get_embedding(query).reshape(1, -1)
            faiss.normalize_L2(q_vec)
            
            # Search
            scores, indices = self.index.search(q_vec, top_k)
            
            # Format results
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.pdf_texts):
                    results.append({
                        "pdf": self.pdf_texts[idx]["pdf"],
                        "pdf_path": self.pdf_texts[idx]["pdf_path"],
                        "page": self.pdf_texts[idx]["page"],
                        "score": float(score),
                        "snippet": self.pdf_texts[idx]["text"][:200] + "...",
                        "full_text": self.pdf_texts[idx]["text"]
                    })
            
            return results
            
        except Exception as e:
            print(f"❌ Error searching: {e}")
            return []
    
    def process_and_search(self, pdf_paths: List[str], query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Complete pipeline: extract text, build index, and search"""
        # Extract text from PDFs
        self.extract_text_from_pdfs(pdf_paths)
        
        # Build index
        if not self.build_index():
            return []
        
        # Search
        return self.search_related(query, top_k)
