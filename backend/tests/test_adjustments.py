def test_create_adjustment(client, auth_headers, app):
    res = client.post("/api/products", json={"name": "Prod", "sku": "A-01", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    client.post("/api/receipts", json={"supplier": "S1", "product_id": product_id, "warehouse_id": 1, "quantity": 100}, headers=auth_headers)

    response = client.post("/api/adjustments", json={
        "product_id": product_id,
        "warehouse_id": 1,
        "new_quantity": 90,
        "reason": "Lost items"
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json["status"] == "success"
    
    from models.inventory_model import Inventory
    with app.app_context():
        inv = Inventory.query.filter_by(product_id=product_id, warehouse_id=1).first()
        assert inv.quantity == 90
