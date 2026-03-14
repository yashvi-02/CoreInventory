def test_create_receipt(client, auth_headers, app):
    # Setup product
    res = client.post("/api/products", json={"name": "Test Prod", "sku": "R-01", "category": "Cat"}, headers=auth_headers)
    assert res.status_code == 201
    product_id = res.json["data"]["id"]

    response = client.post("/api/receipts", json={
        "supplier": "Tech Supplies Inc.",
        "product_id": product_id,
        "warehouse_id": 1,
        "quantity": 100
    }, headers=auth_headers)
    
    assert response.status_code == 201
    assert response.json["status"] == "success"
    assert response.json["data"]["quantity"] == 100

    from models.inventory_model import Inventory
    with app.app_context():
        inv = Inventory.query.filter_by(product_id=product_id, warehouse_id=1).first()
        assert inv is not None
        assert inv.quantity == 100

def test_create_receipt_bad_data(client, auth_headers):
    response = client.post("/api/receipts", json={
        "supplier": "Tech Supplies Inc.",
        "warehouse_id": 1,
        "quantity": 100
    }, headers=auth_headers)
    
    assert response.status_code == 400
    assert response.json["status"] == "fail"
    assert "Missing required field" in response.json["message"]
