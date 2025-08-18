import os
import json
import uuid
from pathlib import Path
from datetime import datetime

class PDFStorage:
    def __init__(self):
        # Use absolute path relative to the backend directory
        self.storage_dir = Path(os.path.dirname(os.path.dirname(__file__))) / "storage"
        self.metadata_file = self.storage_dir / "metadata.json"
        
        # Ensure directory exists
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing metadata
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                self.metadata = {}
        else:
            self.metadata = {}
    
    def save_pdf(self, file, file_id):
        file_path = self.storage_dir / f"{file_id}.pdf"
        file.save(str(file_path))
        
        # Store metadata
        self.metadata[file_id] = {
            'name': file.filename,
            'upload_time': datetime.now().isoformat(),
            'path': str(file_path),
            'size': os.path.getsize(file_path)
        }
        
        self._save_metadata()
        return str(file_path)
    
    def get_file_path(self, file_id):
        if file_id in self.metadata:
            path = self.metadata[file_id]['path']
            if os.path.exists(path):
                return path
        return None
    
    def get_all_files(self):
        valid_files = []
        for file_id, data in self.metadata.items():
            if os.path.exists(data['path']):
                valid_files.append({
                    'id': file_id,
                    'name': data['name'],
                    'upload_time': data['upload_time'],
                    'size': data.get('size', 0)
                })
        return valid_files
    
    def get_upload_time(self, file_id):
        return self.metadata.get(file_id, {}).get('upload_time', '')
    
    def _save_metadata(self):
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving metadata: {e}")

    def get_file_name(self, file_id):
        return self.metadata.get(file_id, {}).get('name', 'document.pdf')
