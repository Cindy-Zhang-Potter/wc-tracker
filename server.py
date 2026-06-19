#!/usr/bin/env python3
import http.server, os
PORT = 3000
DIR = os.path.dirname(os.path.abspath(__file__))
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIR, **k)
print(f'Server: http://localhost:{PORT}/football-analyzer.html')
http.server.HTTPServer(('', PORT), H).serve_forever()
