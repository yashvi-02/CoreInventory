from models.product_model import Product
from extensions.db import db

def test_create_product(client, auth_headers, app, category):
    response = client.post("/api/products", json={
        "name": "Test Product",
        "sku": "TEST-01",
        "category_id": category
    }, headers=auth_headers)
    
    assert response.status_code == 201
    assert response.json["status"] == "success"
    assert response.json["data"]["sku"] == "TEST-01"

    with app.app_context():
        product = Product.query.first()
        assert product is not None
        assert product.name == "Test Product"

def test_get_products(client, auth_headers, category):
    client.post("/api/products", json={"name": "P1", "sku": "S1", "category_id": category}, headers=auth_headers)
    client.post("/api/products", json={"name": "P2", "sku": "S2", "category_id": category}, headers=auth_headers)
    
    response = client.get("/api/products", headers=auth_headers)
    assert response.status_code == 200
    assert response.json["status"] == "success"
    assert len(response.json["data"]) >= 2

def test_update_product(client, auth_headers, app, category):
    res = client.post("/api/products", json={"name": "P1", "sku": "S1", "category_id": category}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    response = client.put(f"/api/products/{product_id}", json={
        "name": "Updated P1"
    }, headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json["data"]["name"] == "Updated P1"
    
    with app.app_context():
        product = Product.query.get(product_id)
        assert product.name == "Updated P1"

def test_delete_product(client, auth_headers, app, category):
    res = client.post("/api/products", json={"name": "P1", "sku": "S1", "category_id": category}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    response = client.delete(f"/api/products/{product_id}", headers=auth_headers)
    assert response.status_code == 200
    
    with app.app_context():
        product = Product.query.get(product_id)
        assert product is None
