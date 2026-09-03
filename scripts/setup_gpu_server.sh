#!/bin/bash
# ============================================================
#  Razorpay Revenue Recovery Brain — GPU Server Setup
#  Run this ONCE on your Ubuntu GPU server (6× RTX 2080 Ti)
#  Installs Ollama, pulls models, starts the inference server
# ============================================================

set -e  # Exit on error

echo ""
echo "=================================================="
echo "  Revenue Recovery Brain — GPU Server Setup"
echo "  Ollama + Mistral-7B + Llama-3-8B"
echo "=================================================="
echo ""

# ── 1. Install Ollama ─────────────────────────────────────
echo "[1/5] Installing Ollama..."
if command -v ollama &> /dev/null; then
    echo "  Ollama already installed: $(ollama --version)"
else
    curl -fsSL https://ollama.com/install.sh | sh
    echo "  Ollama installed successfully."
fi

# ── 2. Start Ollama service temporarily for model pulls ───
echo ""
echo "[2/5] Starting Ollama server (accessible over LAN)..."
OLLAMA_HOST=0.0.0.0:11434 ollama serve &
OLLAMA_PID=$!
sleep 3

# Confirm it's up
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "  Ollama server running (PID: $OLLAMA_PID)"
else
    echo "  ERROR: Ollama server failed to start. Check your installation."
    exit 1
fi

# ── 3. Pull models ─────────────────────────────────────────
echo ""
echo "[3/5] Pulling Mistral-7B-Instruct (4-bit quantized, ~4.5GB)..."
echo "  This model will handle ambiguous payment failure diagnosis."
echo "  GPU target: RTX 2080 Ti GPU 0 (11GB VRAM — plenty of headroom)"
CUDA_VISIBLE_DEVICES=0 ollama pull mistral:7b-instruct-q4_K_M

echo ""
echo "[4/5] Pulling Llama-3-8B-Instruct (4-bit quantized, ~5GB)..."
echo "  This model will handle dynamic Hinglish dialogue + B2B dispute analysis."
echo "  GPU target: RTX 2080 Ti GPU 1 (11GB VRAM — plenty of headroom)"
CUDA_VISIBLE_DEVICES=1 ollama pull llama3:8b-instruct-q4_K_M

# ── 4. Verify models are available ────────────────────────
echo ""
echo "[5/5] Verifying models..."
echo ""
echo "Loaded models:"
curl -s http://localhost:11434/api/tags | python3 -c "
import json, sys
data = json.load(sys.stdin)
for m in data.get('models', []):
    size_gb = m.get('size', 0) / 1e9
    print(f\"  ✓ {m['name']} ({size_gb:.1f} GB)\")
"

# ── 5. Test a quick inference ──────────────────────────────
echo ""
echo "Testing Mistral-7B inference (should return in < 3 seconds on 2080 Ti)..."
START=$(date +%s%3N)
RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{"model":"mistral:7b-instruct-q4_K_M","prompt":"Reply with one word: healthy","stream":false}')
END=$(date +%s%3N)
LATENCY=$((END - START))
RESP_TEXT=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('response','ERROR').strip())")
echo "  Response: '$RESP_TEXT' in ${LATENCY}ms"

# ── 6. Stop the temp server and show final instructions ────
kill $OLLAMA_PID 2>/dev/null || true

echo ""
echo "=================================================="
echo "  SETUP COMPLETE"
echo "=================================================="
echo ""
echo "To START the inference server (run this each time):"
echo ""
echo "  OLLAMA_HOST=0.0.0.0:11434 ollama serve"
echo ""
echo "Or to run persistently in the background:"
echo ""
echo "  nohup env OLLAMA_HOST=0.0.0.0:11434 ollama serve > /tmp/ollama.log 2>&1 &"
echo "  echo \"Ollama running. Logs: /tmp/ollama.log\""
echo ""
echo "Then update backend/.env on Windows:"
echo ""
echo "  LLM_SERVER_URL=http://$(hostname -I | awk '{print $1}'):11434"
echo ""
echo "Your server IP: $(hostname -I | awk '{print $1}')"
echo ""
