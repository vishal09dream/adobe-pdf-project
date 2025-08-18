# Gemini-Powered Search Feature

## Overview
This feature adds intelligent search capabilities to your PDF Intelligence App using Google's Gemini AI API. Users can search across all PDFs in their library using natural language queries.

## Features

### 1. **Gemini Search Panel**
- Located in the right sidebar (Processing Panel)
- Purple-themed section with search input and button
- Searches across selected PDF files

### 2. **Text Selection Search**
- Select text in any PDF viewer
- Click the search button that appears in the top-right corner
- Automatically fills the search query and switches to library view

### 3. **Intelligent Results**
- Uses Gemini embeddings for semantic search
- Returns relevant pages with similarity scores
- Shows snippets of matching content
- Direct navigation to specific pages

## How to Use

### Method 1: Manual Search
1. Select one or more PDF files in the library
2. Go to the Processing Panel (right sidebar)
3. Scroll down to the "Gemini Search" section
4. Enter your search query in the text area
5. Click "Search PDFs"
6. View results with page navigation options

### Method 2: Text Selection Search
1. Open a PDF in the viewer
2. Select/highlight text you want to search for
3. Click the purple search button that appears
4. The app will automatically search for that text across all PDFs

## Technical Implementation

### Backend
- **Service**: `backend/services/gemini_search.py`
- **API Endpoint**: `POST /api/search`
- **Dependencies**: 
  - `google-generativeai` for embeddings
  - `faiss-cpu` for vector similarity search
  - `PyMuPDF` for PDF text extraction

### Frontend
- **Component**: `src/components/ProcessingPanel.jsx`
- **API Service**: `src/services/api.js`
- **Integration**: `src/App.jsx` and `src/components/PDFViewer.jsx`

### Search Process
1. Extract text from all selected PDFs
2. Generate embeddings using Gemini API
3. Build FAISS index for fast similarity search
4. Search query against indexed content
5. Return ranked results with page references

## Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### API Key Setup
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set it as an environment variable or update the default in `backend/app.py`

## Dependencies

### Backend Requirements
```
faiss-cpu==1.7.4
google-generativeai==0.3.2
PyMuPDF==1.23.26
numpy==1.24.3
```

### Installation
```bash
cd backend
pip install -r requirements.txt
```

## Usage Examples

### Search Queries
- "machine learning algorithms"
- "API design patterns"
- "data structures and algorithms"
- "web development best practices"
- "database optimization techniques"

### Expected Results
- **PDF Name**: Document containing the content
- **Page Number**: Specific page where content was found
- **Similarity Score**: How well the content matches your query (0-100%)
- **Snippet**: Preview of the matching content
- **Navigation**: Direct link to the specific page

## Performance Notes

- **First Search**: May take longer as it builds the index
- **Subsequent Searches**: Fast vector similarity search
- **Memory Usage**: Indexes are built in memory for each search session
- **File Size**: Larger PDFs may take longer to process

## Troubleshooting

### Common Issues
1. **API Key Error**: Check your Gemini API key configuration
2. **No Results**: Ensure PDFs contain searchable text (not just images)
3. **Slow Performance**: Large PDFs may take time to process
4. **Import Errors**: Verify all dependencies are installed

### Debug Information
- Check browser console for frontend errors
- Check backend logs for API errors
- Verify PDF files are accessible and contain text

## Future Enhancements

- **Persistent Indexing**: Save indexes for faster subsequent searches
- **Advanced Filters**: Filter by date, file type, or content type
- **Search History**: Remember and suggest previous searches
- **Batch Processing**: Process multiple search queries at once
- **Export Results**: Save search results to file or clipboard
