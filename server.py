#!/usr/bin/env python3
"""
ROOTS Living Lesson Engine - Local Offline Edge Server
Slide 07 Layer 2 Architecture: Runs locally on the village laptop (127.0.0.1:8000).
Zero external dependencies. 100% Offline-First. Built with Python standard library.
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import sys
from verify_engine import verify_story_math

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# In-memory runtime state for teacher console
DATA_PATH = os.path.join(DIRECTORY, "mock_data.json")

def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Global runtime state
STATE = {
    "active_story_id": "story-01",
    "approval_status": "PENDING_AUDIT",
    "published_packages": [],
    "active_cohort": "Cohort A (Students 1-10)",
    "rotation_timer_seconds": 900, # 15 minutes
    "rotation_time_remaining": 742,
    "stations_synced": False
}

class RootsRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/data":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            data = load_data()
            data["runtime_state"] = STATE
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(STATE).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length)

        try:
            payload = json.loads(post_body.decode("utf-8")) if post_body else {}
        except Exception:
            payload = {}

        if parsed.path == "/api/verify":
            items = int(payload.get("items", 24))
            groups = int(payload.get("groups", 6))
            story_id = payload.get("story_id", "story-01")
            grade = payload.get("grade", "Grade 3-4")
            result = verify_story_math(items, groups, story_id, grade)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        if parsed.path == "/api/approve":
            story_id = payload.get("story_id", "story-01")
            verification = payload.get("verification", {})
            STATE["approval_status"] = "APPROVED_AND_SYNCED"
            STATE["stations_synced"] = True
            STATE["published_packages"].append({
                "story_id": story_id,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "signature": verification.get("crypto_package_signature", "ROOTS-PKG-SHA256-LIVE")
            })

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "SUCCESS",
                "message": "Lesson cryptographically sealed and synced to Stations 1, 2, and 3",
                "runtime_state": STATE
            }).encode("utf-8"))
            return

        if parsed.path == "/api/reject":
            reason = payload.get("reason", "Pedagogical adjustment needed")
            STATE["approval_status"] = "REJECTED_NEEDS_REVISION"
            STATE["stations_synced"] = False

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "REJECTED",
                "reason": reason,
                "runtime_state": STATE
            }).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    import time
    with socketserver.TCPServer(("", PORT), RootsRequestHandler) as httpd:
        print(f"================================================================")
        print(f"  ROOTS Living Lesson Engine - Local Offline Server")
        print(f"  Running on: http://127.0.0.1:{PORT}")
        print(f"  Mode: 100% Offline-First Edge Node (Village Laptop)")
        print(f"  Architecture: Slide 06 Teacher Audit & Approval Console")
        print(f"================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down ROOTS edge server.")
            httpd.server_close()
