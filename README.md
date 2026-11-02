# Jellyfin Profanity Filter AI Service

Docker container for the AI inference layer of the Jellyfin profanity filter plugin. This service handles real-time speech-to-text transcription and profanity detection using Whisper.cpp and Phi-2 LLM.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│  Jellyfin       │────▶│  Profanity Filter AI    │◀───│  Audio Stream   │
│  Plugin         │     │  Service (Docker)       │     │  from Playback  │
└─────────────────┘     └─────────────────────────┘     └─────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Whisper.cpp STT     │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Phi-2 Profanity     │
                    │  Classifier          │
                    └──────────────────────┘
```

## System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **CPU**: Modern multi-core processor with AVX2 support
- **GPU** (Optional): NVIDIA GPU for accelerated inference
- **Disk Space**: ~3GB for Phi-2 model, ~1.3GB for TinyLlama alternative

## Quick Start with Docker

### Step 1: Download the AI Model

```bash
# Create models directory
mkdir -p models

# Download Phi-2 model (~2GB)
wget https://huggingface.co/microsoft/Phi-2/resolve/main/ggml-phi-2-f16.gguf \
  -O models/ggml-phi-2-f16.gguf

# OR download TinyLlama (~1.3GB) as alternative
# wget https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/ggml-model-q4_k_m.gguf \
#   -O models/ggml-model-q4_k_m.gguf
```

### Step 2: Build the Docker Image

```bash
docker build -t jellyfin-profanity-filter-ai .
```

### Step 3: Run the Container

```bash
docker run -d \
  --name jellyfin-profanity-filter-ai \
  --net host \
  -v /path/to/models:/app/models:ro \
  -e MODEL_PATH=/app/models/ggml-phi-2-f16.gguf \
  -e MODEL_TYPE=phi-2 \
  -e CONFIDENCE_THRESHOLD=0.5 \
  -e AUDIO_CHUNK_SIZE=1000 \
  jellyfin-profanity-filter-ai
```

### Step 4: Get Container Logs

```bash
docker logs -f jellyfin-profanity-filter-ai
```

## Unraid Docker Setup

### Create docker-compose.yml

Create a file named `docker-compose.yml` in your Unraid share:

```yaml
version: '3'
services:
  jellyfin-profanity-filter-ai:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jellyfin-profanity-filter-ai
    network_mode: host
    volumes:
      - /path/to/models:/app/models:ro
    environment:
      - MODEL_PATH=/app/models/ggml-phi-2-f16.gguf
      - MODEL_TYPE=phi-2
      - CONFIDENCE_THRESHOLD=0.5
      - AUDIO_CHUNK_SIZE=1000
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 3
      window: 120s
```

### Add to Unraid Docker

1. Open Unraid Docker Manager
2. Click "Add Container"
3. Select image: `jellyfin-profanity-filter-ai` (or build from local Dockerfile)
4. Configure volumes to mount your models directory
5. Set environment variables as shown above
6. Start the container

## Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MODEL_PATH` | `/app/models/ggml-phi-2-f16.gguf` | Path to GGUF model file |
| `MODEL_TYPE` | `phi-2` | Model type: `phi-2` or `tinyllama` |
| `CONFIDENCE_THRESHOLD` | `0.5` | Minimum confidence for profanity detection (0.1-1.0) |
| `AUDIO_CHUNK_SIZE` | `1000` | Audio chunk size in milliseconds |
| `N_BATCH` | `512` | Batch size for inference |
| `N_THREADS` | `4` | Number of CPU threads to use |

## API Endpoints

Once running, the AI service exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transcode-hook` | POST | Handle transcoding events from Jellyfin |
| `/api/filter-status` | GET | Get current filter status |
| `/api/playback-control/pause` | POST | Pause playback |
| `/api/playback-control/resume` | POST | Resume playback |

### Example: Check Filter Status

```bash
curl http://localhost:3000/api/filter-status
```

Response:
```json
{
  "enabled": true,
  "confidenceThreshold": 0.5,
  "wordsCount": 8,
  "isProcessing": false
}
```

## API Request Examples

### Pause Playback (when profanity detected)

```bash
curl -X POST http://localhost:3000/api/playback-control/pause \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "12345",
    "action": "pause"
  }'
```

### Resume Playback

```bash
curl -X POST http://localhost:3000/api/playback-control/resume \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "12345",
    "action": "resume"
  }'
```

## Model Options

### Phi-2 (Recommended)
- **Size**: ~2GB (f16 quantization)
- **Quality**: High accuracy profanity detection
- **Download**: https://huggingface.co/microsoft/Phi-2

### TinyLlama (Lightweight Alternative)
- **Size**: ~1.3GB (q4_k_m quantization)
- **Quality**: Good for lower-end hardware
- **Download**: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0

## Troubleshooting

### Model Not Found Error

```bash
# Verify model file exists
ls -lh /path/to/models/ggml-phi-2-f16.gguf

# Check container can see the file
docker exec jellyfin-profanity-filter-ai ls -lh /app/models/
```

### Out of Memory

```bash
# Reduce batch size in environment variables
export N_BATCH=256

# Or use smaller model quantization
# Download q4_k_m instead of f16
```

### Slow Inference

```bash
# Increase CPU threads
export N_THREADS=8

# Enable GPU if available (requires additional setup)
```

## Updating the Model

To update to a newer model version:

```bash
# Stop the container
docker stop jellyfin-profanity-filter-ai

# Download new model
wget https://huggingface.co/microsoft/Phi-2/resolve/main/ggml-phi-2-q8_0.gguf \
  -O models/ggml-phi-2-q8_0.gguf

# Start container with new model
docker start jellyfin-profanity-filter-ai
```

## Cleanup

To remove the container and image:

```bash
docker stop jellyfin-profanity-filter-ai
docker rm jellyfin-profanity-filter-ai
docker rmi jellyfin-profanity-filter-ai
```

## License

MIT License - See LICENSE file for details.
