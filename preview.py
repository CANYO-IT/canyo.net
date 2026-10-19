#!/usr/bin/env python3
"""Simple local preview server for the CANYO site."""
import http.server
import socketserver
import os
import webbrowser

PORT = 8765
ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

if __name__ == "__main__":
    url = f"http://localhost:{PORT}/canyo-os/"
    print(f"Serving CANYO site from {ROOT}")
    print(f"Preview URL: {url}")
    webbrowser.open(url)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nPreview server stopped.")
