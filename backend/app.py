import os
import json
import tempfile
import uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from services.pdf_processor_1a import extract_outline_from_pdf
from services.pdf_processor_1b import extract_sections
from services.storage import PDFStorage
from services.gemini_search import GeminiSearchService
from services.azure_tts import AzureTTSService

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# //////////////////
# @app.route('/')
# def serve():
#     return send_from_directory(app.static_folder, 'index.html')

# @app.route('/api/upload', methods=['POST'])
# def upload_pdfs():
#     try:
#         files = request.files.getlist('pdfs')
#         uploaded_files = []
        
#         for file in files:
#             if file and file.filename.endswith('.pdf'):
#                 file_id = str(uuid.uuid4())
#                 file_path = storage.save_pdf(file, file_id)
                
#                 # Process with 1A (heading extraction)
#                 outline_1a = extract_outline_from_pdf(file_path)
                
#                 uploaded_files.append({
#                     'id': file_id,
#                     'name': file.filename,
#                     'outline': outline_1a,
#                     'upload_time': storage.get_upload_time(file_id)
#                 })
        
#         return jsonify({'success': True, 'files': uploaded_files})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/library', methods=['GET'])
# def get_library():
#     try:
#         files = storage.get_all_files()
#         return jsonify({'files': files})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/process-1a/<file_id>', methods=['GET'])
# def process_1a(file_id):
#     try:
#         file_path = storage.get_file_path(file_id)
#         if not file_path:
#             return jsonify({'error': 'File not found'}), 404
        
#         outline = extract_outline_from_pdf(file_path)
#         return jsonify(outline)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/process-1b', methods=['POST'])
# def process_1b():
#     try:
#         data = request.json
#         file_ids = data.get('file_ids', [])
#         persona = data.get('persona', '')
#         objective = data.get('objective', '')
        
#         if not file_ids or not persona or not objective:
#             return jsonify({'error': 'Missing required parameters'}), 400
        
#         # Get file paths
#         file_paths = []
#         for file_id in file_ids:
#             path = storage.get_file_path(file_id)
#             if path:
#                 file_paths.append(path)
        
#         if not file_paths:
#             return jsonify({'error': 'No valid files found'}), 404
        
#         # Process with 1B
#         results = extract_sections(file_paths, persona, objective)
#         return jsonify(results)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/insights', methods=['POST'])
# def get_insights():
#     try:
#         data = request.json
#         content = data.get('content', '')
        
#         model = genai.GenerativeModel('gemini-2.5-flash')
        
#         prompt = f"""
#         Analyze the following content and provide insights in JSON format:
        
#         Content: {content}
        
#         Provide:
#         1. key_insights: 3-5 main takeaways
#         2. did_you_know: 2-3 interesting facts
#         3. contradictions: any conflicting information
#         4. connections: potential links to other topics
        
#         Return as valid JSON only.
#         """
        
#         response = model.generate_content(prompt)
#         insights = json.loads(response.text)
        
#         return jsonify(insights)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
# @app.route('/api/tts', methods=['POST'])
# def tts_unified():
#     """
#     Unified Text-to-Speech API - Azure, Google, Local (espeak-ng)
#     Expects:
#       - text (str): required
#       - voice (str): optional
#       - provider (str): optional ("azure", "gcp", "local")
#     Returns: Audio file as bytes (audio/mp3)
#     """
#     try:
#         data = request.json
#         text = data.get('text', '').strip()
#         if not text:
#             return jsonify({'error': 'Missing text parameter'}), 400
#         voice = data.get('voice')
#         provider = data.get('provider')  # optional, use backend default if not set

#         # Generate audio file path in temp
#         temp_dir = Path(tempfile.gettempdir())
#         output_file = str(temp_dir / f"tts_{uuid.uuid4().hex}.mp3")

#         tts_path = tts_service.generate_audio(text, output_file, provider=provider, voice=voice)
#         if not os.path.exists(tts_path):
#             return jsonify({'error': 'TTS synthesis failed; file not found'}), 500

#         return send_file(tts_path, mimetype="audio/mp3", as_attachment=False)

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
# ///////////////////
# Initialize services
storage = PDFStorage()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyBZhsSvOQWgIkjfRcsi5r6D2Cjcxsu9-WU'))

# Configure Azure TTS
AZURE_TTS_KEY = "9ioGGP4nqTu6XnZvyoKR0t9bN2Be8f6R8wlwhdn1qWoL3SiRQLQrJQQJ99BHACqBBLyXJ3w3AAAYACOG3gE3"
AZURE_TTS_REGION = "southeastasia"
azure_tts_service = AzureTTSService(AZURE_TTS_KEY, AZURE_TTS_REGION)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/upload', methods=['POST'])
def upload_pdfs():
    try:
        files = request.files.getlist('pdfs')
        uploaded_files = []
        
        for file in files:
            if file and file.filename.endswith('.pdf'):
                file_id = str(uuid.uuid4())
                file_path = storage.save_pdf(file, file_id)
                
                # Process with 1A (heading extraction)
                outline_1a = extract_outline_from_pdf(file_path)
                
                uploaded_files.append({
                    'id': file_id,
                    'name': file.filename,
                    'outline': outline_1a,
                    'upload_time': storage.get_upload_time(file_id)
                })
        
        return jsonify({'success': True, 'files': uploaded_files})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/library', methods=['GET'])
def get_library():
    try:
        files = storage.get_all_files()
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process-1a/<file_id>', methods=['GET'])
def process_1a(file_id):
    try:
        file_path = storage.get_file_path(file_id)
        if not file_path:
            return jsonify({'error': 'File not found'}), 404
        
        outline = extract_outline_from_pdf(file_path)
        return jsonify(outline)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process-1b', methods=['POST'])
def process_1b():
    try:
        data = request.json
        file_ids = data.get('file_ids', [])
        persona = data.get('persona', '')
        objective = data.get('objective', '')
        
        if not file_ids or not persona or not objective:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Get file paths
        file_paths = []
        for file_id in file_ids:
            path = storage.get_file_path(file_id)
            if path:
                file_paths.append(path)
        
        if not file_paths:
            return jsonify({'error': 'No valid files found'}), 404
        
        # Process with 1B
        results = extract_sections(file_paths, persona, objective)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights', methods=['POST'])
def get_insights():
    try:
        data = request.json
        content = data.get('content', '')
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Analyze the following content and provide insights in JSON format:
        
        Content: {content}
        
        Provide:
        1. key_insights: 3-5 main takeaways
        2. did_you_know: 2-3 interesting facts
        3. contradictions: any conflicting information
        4. connections: potential links to other topics
        
        Return as valid JSON only.
        """
        
        response = model.generate_content(prompt)
        insights = json.loads(response.text)
        
        return jsonify(insights)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/tts', methods=['POST'])
def tts_unified():
    """
    Unified Text-to-Speech API - Azure, Google, Local (espeak-ng)
    Expects:
      - text (str): required
      - voice (str): optional
      - provider (str): optional ("azure", "gcp", "local")
    Returns: Audio file as bytes (audio/mp3)
    """
    try:
        data = request.json
        text = data.get('text', '').strip()
        if not text:
            return jsonify({'error': 'Missing text parameter'}), 400
        voice = data.get('voice')
        provider = data.get('provider')  # optional, use backend default if not set

        # Generate audio file path in temp
        temp_dir = Path(tempfile.gettempdir())
        output_file = str(temp_dir / f"tts_{uuid.uuid4().hex}.mp3")

        tts_path = tts_service.generate_audio(text, output_file, provider=provider, voice=voice)
        if not os.path.exists(tts_path):
            return jsonify({'error': 'TTS synthesis failed; file not found'}), 500

        return send_file(tts_path, mimetype="audio/mp3", as_attachment=False)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ////////////////////////////////////////////////////////////////////////////////
# @app.route('/api/podcast', methods=['POST'])
# def generate_podcast():
#     try:
#         data = request.json
#         content = data.get('content', '')
#         insights = data.get('insights', {})
        
#         # Generate script using Gemini
#         model = genai.GenerativeModel('gemini-2.5-flash')
        
#         prompt = f"""
#         Create a 2-3 minute podcast script based on:
#         Content: {content}
#         Insights: {insights}
        
#         Make it engaging, conversational, and informative.
#         Include smooth transitions and a natural flow.
#         Requirements:
#         - Write only the spoken script (no stage directions, no 'Music Starts/Ends', no 'Host:' labels).
#         - Make it engaging, conversational, and informative.
#         - Use smooth transitions and a natural flow.
#         - Output plain text only.
#         """
        
#         response = model.generate_content(prompt)
#         script = response.text
        
#         # For demo, return script as text file
#         temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
#         temp_file.write(script)
#         temp_file.close()
        
#         return send_file(temp_file.name, as_attachment=True, 
#                         download_name='podcast_script.txt', mimetype='text/plain')
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
@app.route('/api/pdf/<file_id>')
def serve_pdf(file_id):
    try:
        file_path = storage.get_file_path(file_id)
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=False,
            download_name=storage.get_file_name(file_id)
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search_pdfs():
    try:
        data = request.json
        query = data.get('query', '')
        file_ids = data.get('file_ids', [])
        
        if not query or not file_ids:
            return jsonify({'error': 'Missing query or file_ids'}), 400
        
        # Get file paths and metadata for selected files
        file_paths = []
        file_metadata = {}
        for file_id in file_ids:
            path = storage.get_file_path(file_id)
            if path and os.path.exists(path):
                file_paths.append(path)
                file_metadata[path] = {
                    'id': file_id,
                    'name': storage.get_file_name(file_id)
                }
        
        if not file_paths:
            return jsonify({'error': 'No valid files found'}), 404
        
        # Initialize Gemini search service
        api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyBZhsSvOQWgIkjfRcsi5r6D2Cjcxsu9-WU')
        search_service = GeminiSearchService(api_key)
        
        # Process and search
        results = search_service.process_and_search(file_paths, query, top_k=5)
        
        # Add file metadata to results
        for result in results:
            if result['pdf_path'] in file_metadata:
                result['file_id'] = file_metadata[result['pdf_path']]['id']
                result['file_name'] = file_metadata[result['pdf_path']]['name']
        
        return jsonify({
            'success': True,
            'results': results,
            'query': query,
            'files_searched': len(file_paths)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-related', methods=['POST'])
def search_related_with_insights():
    try:
        data = request.json
        selected_text = data.get('selected_text', '')
        file_ids = data.get('file_ids', [])
        
        if not selected_text or not file_ids:
            return jsonify({'error': 'Missing selected_text or file_ids'}), 400
        
        # Get file paths and metadata for selected files
        file_paths = []
        file_metadata = {}
        for file_id in file_ids:
            path = storage.get_file_path(file_id)
            if path and os.path.exists(path):
                file_paths.append(path)
                file_metadata[path] = {
                    'id': file_id,
                    'name': storage.get_file_name(file_id)
                }
        
        if not file_paths:
            return jsonify({'error': 'No valid files found'}), 404
        
        # Initialize Gemini search service
        api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyBZhsSvOQWgIkjfRcsi5r6D2Cjcxsu9-WU')
        search_service = GeminiSearchService(api_key)
        
        # Process and search
        results = search_service.process_and_search(file_paths, selected_text, top_k=5)
        
        # Add file metadata to results
        for result in results:
            if result['pdf_path'] in file_metadata:
                result['file_id'] = file_metadata[result['pdf_path']]['id']
                result['file_name'] = file_metadata[result['pdf_path']]['name']
        
        # Generate insights
        all_related_text = "\n".join([result['full_text'] for result in results])
        
        # Insight Generation
        insight_model = genai.GenerativeModel("gemini-2.5-flash")
        insight_prompt = f"""
        Based on the following selected text and related content, 
        give me a short, insightful, and interesting note. 
        Include things like 'Did you know?', 'An exception is...', 
        'A contradiction is...', or surprising facts.

        Selected text: {selected_text}

        Related content:
        {all_related_text}
        """
        
        insight_response = insight_model.generate_content(insight_prompt)
        insight = insight_response.text
        
        # Podcast Generation
        podcast_prompt = f"""
        Create a short, conversational podcast script (max 1 minute) 
        explaining the key points of the selected text and related content.
        Make it friendly and engaging.
        Requirements:
        - Write only the spoken script (no stage directions, no 'Music Starts/Ends', no 'Host:' labels).
        - Make it engaging, conversational, and informative.
        - Use smooth transitions and a natural flow.
        - Output plain text only.

        Selected text: {selected_text}
        Related content: {all_related_text}
        """
        
        podcast_response = insight_model.generate_content(podcast_prompt)
        script = podcast_response.text
        
        # Generate audio using Azure TTS
        audio_result = azure_tts_service.generate_podcast_audio(script)
        
        if audio_result['success']:
            audio_url = f"/api/audio/{audio_result['audio_filename']}"
        else:
            audio_url = None
        
        return jsonify({
            'success': True,
            'related': results,
            'insight': insight,
            'podcast': {
                'script': script,
                'audio_url': audio_url,
                'audio_filename': audio_result.get('audio_filename'),
                'file_size': audio_result.get('file_size'),
                'duration_estimate': audio_result.get('duration_estimate'),
                'script_length': len(script)
            },
            'selected_text': selected_text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    """Generate audio from text using Azure TTS"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Missing text parameter'}), 400
        
        # Generate audio
        result = azure_tts_service.generate_podcast_audio(text)
        
        if result['success']:
            # Create audio URL
            audio_url = f"/api/audio/{result['audio_filename']}"
            
            return jsonify({
                'success': True,
                'audio_url': audio_url,
                'audio_filename': result['audio_filename'],
                'file_size': result['file_size'],
                'duration_estimate': result['duration_estimate'],
                'script_length': result['script_length']
            })
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<filename>')
def serve_audio(filename):
    """Serve audio files"""
    try:
        audio_dir = Path("storage/audio")
        audio_path = audio_dir / filename
        
        if not audio_path.exists():
            return jsonify({'error': 'Audio file not found'}), 404
        
        return send_file(
            audio_path,
            mimetype='audio/wav',
            as_attachment=False,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/voices', methods=['GET'])
def get_available_voices():
    """Get list of available TTS voices"""
    try:
        voices = azure_tts_service.get_available_voices()
        return jsonify({
            'success': True,
            'voices': voices
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/configure', methods=['POST'])
def configure_tts():
    """Configure TTS settings (voice, speed, etc.)"""
    try:
        data = request.json
        voice = data.get('voice')
        speaking_rate = data.get('speaking_rate')
        
        if voice:
            azure_tts_service.change_voice(voice)
        
        if speaking_rate is not None:
            azure_tts_service.adjust_speaking_rate(speaking_rate)
        
        return jsonify({
            'success': True,
            'message': 'TTS configuration updated'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a PDF file from storage"""
    try:
        file_path = storage.get_file_path(file_id)
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        os.remove(file_path)
        
        if file_id in storage.metadata:
            del storage.metadata[file_id]
            storage._save_metadata()
        
        return jsonify({'success': True, 'message': 'File deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
