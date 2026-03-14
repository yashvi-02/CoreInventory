def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "new@example.com",
        "password": "securepassword",
        "role": "user"
    })
    
    assert response.status_code == 201
    assert response.json["status"] == "success"
    assert response.json["message"] == "User registered successfully"
    assert "id" in response.json["data"]

def test_register_duplicate_email(client):
    payload = {
        "name": "New User",
        "email": "new2@example.com",
        "password": "securepassword",
        "role": "user"
    }
    client.post("/api/auth/register", json=payload)
    
    # Try again
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert response.json["status"] == "fail"

def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "password",
        "role": "user"
    })
    
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "password"
    })
    
    assert response.status_code == 200
    assert response.json["status"] == "success"
    assert "token" in response.json["data"]

def test_login_invalid_password(client):
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login2@example.com",
        "password": "password",
        "role": "user"
    })
    
    response = client.post("/api/auth/login", json={
        "email": "login2@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401
    assert response.json["status"] == "fail"
