FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create models directory inside container
RUN mkdir -p /app/models

# Download Phi-2 model (~2GB)
RUN wget -q https://huggingface.co/microsoft/Phi-2/resolve/main/ggml-phi-2-f16.gguf \
  -O /app/models/ggml-phi-2-f16.gguf && \
  echo "Phi-2 model downloaded successfully"

# Download TinyLlama model (~1.3GB)
RUN wget -q https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/ggml-model-q4_k_m.gguf \
  -O /app/models/ggml-model-q4_k_m.gguf && \
  echo "TinyLlama model downloaded successfully"

# Build the application
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
