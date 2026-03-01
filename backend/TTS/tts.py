import io
import os
import sys
from typing import Optional
import uuid
import torch
import torchaudio
import modal
from pydantic import BaseModel


app = modal.App(name="echocraft-tts-service")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("numpy==1.26.0", "torch==2.6.0")
    .pip_install_from_requirements("TTS/requirements.txt")
    .apt_install("ffmpeg")
)

volume = modal.Volume.from_name("echocraft-cache", create_if_missing=True)

s3_secret = modal.Secret.from_name("ai-voice-studio-aws-secret")

class TTSRequest(BaseModel):
    text: str
    voice_s3_key: Optional[str] = None
    language: str = "en"
    exaggeration: float = 0.5
    cfg_weight: float = 0.5


class TTSResponse(BaseModel):
    generated_audio_s3_key: str


@app.cls(
    image=image,
    gpu="L40S",
    volumes={
        "/root/.cache/huggingface": volume,
        "/s3-mount": modal.CloudBucketMount("ai-voice-studio-rohan", secret=s3_secret)
    },
    scaledown_window=120,
    secrets=[s3_secret]
)

class TTSService:
    @modal.enter()
    def load_model(self):
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        self.model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")

        
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_speech(self, request: TTSRequest) -> TTSResponse:
        with torch.no_grad():
            if request.voice_s3_key:
                audio_prompt_path = f"/s3-mount/{request.voice_s3_key}"

                if not os.path.exists(audio_prompt_path):
                    raise FileNotFoundError(f"Audio prompt not found at {audio_prompt_path}")
                wav = self.model.generate(
                    request.text,
                    audio_prompt_path=audio_prompt_path,
                    language_id=request.language,
                    exaggeration=request.exaggeration,
                    cfg_weight=request.cfg_weight
                )
    
            else:
                wav = self.model.generate(
                    request.text,
                    language_id=request.language,
                    exaggeration=request.exaggeration,
                    cfg_weight=request.cfg_weight
                )
            wav_cpu = wav.cpu()

        # convert audio tensor to wav format bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav_cpu, self.model.sr, format="wav")
        buffer.seek(0)
        audio_bytes = buffer.read()

        audio_uuid = str(uuid.uuid4())
        s3_key = f"tts_outputs/{audio_uuid}.wav"
        s3_path = f"/s3-mount/{s3_key}"
        os.makedirs(os.path.dirname(s3_path), exist_ok=True)
        with open(s3_path, "wb") as f:
            f.write(audio_bytes)
        print(f"Generated audio saved to S3 at {s3_key}")
        return TTSResponse(generated_audio_s3_key=s3_key)
