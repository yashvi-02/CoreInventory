import urllib.request
import json
import traceback

def test_api(url, data):
    print(f"\n--- Testing POST {url} ---")
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            print("Status:", response.status)
            print("Response:", response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Response:", e.read().decode('utf-8'))
    except Exception as e:
        print("Other Error:", e)

test_api('http://127.0.0.1:5000/api/auth/register', {
    "name": "Test",
    "email": "test@example.com",
    "password": "123",
    "role": "user"
})

test_api('http://127.0.0.1:5000/api/products', {
    "name": "Prod",
    "sku": "P1",
    "category": "cat"
})
