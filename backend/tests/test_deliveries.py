def test_create_delivery(client, auth_headers, app):
    res = client.post("/api/products", json={"name": "Prod", "sku": "D-01", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    client.post("/api/receipts", json={"supplier": "S1", "product_id": product_id, "warehouse_id": 1, "quantity": 100}, headers=auth_headers)

    response = client.post("/api/deliveries", json={
        "customer": "Customer Corp",
        "product_id": product_id,
        "warehouse_id": 1,
        "quantity": 25
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json["status"] == "success"
    assert response.json["data"]["quantity"] == 25

    from models.inventory_model import Inventory
    with app.app_context():
        inv = Inventory.query.filter_by(product_id=product_id, warehouse_id=1).first()
        assert inv.quantity == 75

def test_create_delivery_insufficient_stock(client, auth_headers):
    res = client.post("/api/products", json={"name": "Prod3", "sku": "D-02", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    response = client.post("/api/deliveries", json={
        "customer": "Customer Corp",
        "product_id": product_id,
        "warehouse_id": 1,
        "quantity": 50
    }, headers=auth_headers)

    # Should fail as there is 0 stock
    assert response.status_code == 400
    assert response.json["status"] == "fail"
