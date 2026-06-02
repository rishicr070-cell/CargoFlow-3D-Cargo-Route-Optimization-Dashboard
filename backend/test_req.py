import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/algorithm/dijkstra',
    data=json.dumps({"source":"IN-JNP", "target":"AU-MEL", "weight":"cost"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
