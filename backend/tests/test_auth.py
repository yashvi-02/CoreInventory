def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "new@example.com",
        "password": "securepassword",
        "role": "user"
    })
    
    assert response.status_code == 201
    assert response.json["status"] == "success"
    assert response.json["message"] == "Registration successful. Verify your email to continue."
    assert response.json["data"]["pending_verification"] is True
    assert "development_otp" in response.json["data"]

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
    register_response = client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "password",
        "role": "user"
    })

    otp = register_response.json["data"]["development_otp"]
    verify_response = client.post("/api/auth/verify-email", json={
        "email": "login@example.com",
        "otp": otp
    })

    assert verify_response.status_code == 200

    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "password"
    })
    
    assert response.status_code == 200
    assert response.json["status"] == "success"
    assert response.json["data"]["pending_otp"] is True
    assert "development_otp" in response.json["data"]

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
