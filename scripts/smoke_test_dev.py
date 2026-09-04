import urllib.request
import json
import sys

print("=== Testing Dev Servers ===")

# Backend test
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/", timeout=5) as resp:
        data = json.loads(resp.read().decode())
        print(f"[Backend :8000] OK (status {resp.status}) -> {data.get('status')} - {data.get('name')}")
except Exception as e:
    print(f"[Backend :8000] Failed: {e}")

# Frontend test
try:
    with urllib.request.urlopen("http://localhost:5173/", timeout=5) as resp:
        content = resp.read().decode()
        print(f"[Frontend :5173] OK (status {resp.status}) -> {len(content)} bytes loaded, Title in HTML: {'Razorpay' in content}")
except Exception as e:
    print(f"[Frontend :5173] Failed: {e}")

# Test critical API endpoint
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/api/ab-test/results", timeout=5) as resp:
        data = json.loads(resp.read().decode())
        print(f"[API /api/ab-test/results] OK -> methodology: {data.get('methodology')}")
except Exception as e:
    print(f"[API /api/ab-test/results] Failed: {e}")
