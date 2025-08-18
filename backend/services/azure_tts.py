import os
import tempfile
import uuid
from pathlib import Path
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer
from azure.cognitiveservices.speech.audio import AudioOutputConfig

class AzureTTSService:
    def __init__(self, api_key: str, region: str = "eastus"):
        """Initialize Azure TTS service with API key and region"""
        self.api_key = api_key
        self.region = region
        self.speech_config = SpeechConfig(subscription=api_key, region=region)
        
        # Configure speech synthesis
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
        self.speech_config.speech_synthesis_speaking_rate = 1.0  # Normal speed
        self.speech_config.speech_synthesis_pitch = 0  # Normal pitch
        
    def text_to_speech(self, text: str, output_filename: str = None) -> str:
        """Convert text to speech and return the audio file path"""
        try:
            # Create temporary file for audio output
            if not output_filename:
                output_filename = f"podcast_{uuid.uuid4().hex[:8]}.wav"
            
            # Ensure output directory exists
            output_dir = Path("storage/audio")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            output_path = output_dir / output_filename
            
            # Configure audio output
            audio_config = AudioOutputConfig(filename=str(output_path))
            
            # Create synthesizer
            synthesizer = SpeechSynthesizer(
                speech_config=self.speech_config, 
                audio_config=audio_config
            )
            
            # Synthesize speech
            result = synthesizer.speak_text_async(text).get()
            
            if result.reason.name == "SynthesizingAudioCompleted":
                print(f"✅ Audio generated successfully: {output_path}")
                return str(output_path)
            else:
                print(f"❌ Audio generation failed: {result.reason}")
                return None
                
        except Exception as e:
            print(f"❌ Error in text-to-speech: {e}")
            return None
    
    def generate_podcast_audio(self, script: str) -> dict:
        """Generate podcast audio from script and return metadata"""
        try:
            # Clean and format the script for better speech synthesis
            cleaned_script = self._clean_script_for_speech(script)
            
            # Generate audio file
            audio_filename = f"podcast_{uuid.uuid4().hex[:8]}.wav"
            audio_path = self.text_to_speech(cleaned_script, audio_filename)
            
            if audio_path:
                # Get file size
                file_size = os.path.getsize(audio_path)
                
                return {
                    'success': True,
                    'audio_path': audio_path,
                    'audio_filename': audio_filename,
                    'file_size': file_size,
                    'duration_estimate': self._estimate_duration(cleaned_script),
                    'script_length': len(cleaned_script)
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to generate audio'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _clean_script_for_speech(self, script: str) -> str:
        """Clean and format script for better speech synthesis"""
        # Remove markdown formatting
        cleaned = script.replace('**', '').replace('*', '').replace('`', '')
        
        # Add pauses for better flow
        cleaned = cleaned.replace('. ', '. ... ')
        cleaned = cleaned.replace('! ', '! ... ')
        cleaned = cleaned.replace('? ', '? ... ')
        
        # Remove excessive whitespace
        cleaned = ' '.join(cleaned.split())
        
        return cleaned
    
    def _estimate_duration(self, text: str) -> float:
        """Estimate audio duration based on text length"""
        # Average speaking rate is about 150 words per minute
        words = len(text.split())
        duration_minutes = words / 150.0
        return round(duration_minutes, 2)
    
    def get_available_voices(self) -> list:
        """Get list of available voices"""
        try:
            # This is a simplified list - in production you might want to fetch from Azure
            voices = [
                "en-US-JennyNeural",      # Female, friendly
                "en-US-GuyNeural",        # Male, professional
                "en-US-AriaNeural",       # Female, clear
                "en-US-DavisNeural",      # Male, warm
                "en-GB-SoniaNeural",      # British female
                "en-GB-RyanNeural",       # British male
            ]
            return voices
        except Exception as e:
            print(f"Error getting voices: {e}")
            return ["en-US-JennyNeural"]  # Default fallback
    
    def change_voice(self, voice_name: str):
        """Change the voice for speech synthesis"""
        try:
            self.speech_config.speech_synthesis_voice_name = voice_name
            print(f"✅ Voice changed to: {voice_name}")
        except Exception as e:
            print(f"❌ Error changing voice: {e}")
    
    def adjust_speaking_rate(self, rate: float):
        """Adjust speaking rate (0.5 = slow, 2.0 = fast)"""
        try:
            self.speech_config.speech_synthesis_speaking_rate = rate
            print(f"✅ Speaking rate adjusted to: {rate}")
        except Exception as e:
            print(f"❌ Error adjusting speaking rate: {e}")
