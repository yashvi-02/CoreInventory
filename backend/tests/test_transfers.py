def test_create_transfer(client, auth_headers, app):
    res = client.post("/api/products", json={"name": "Prod", "sku": "T-01", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    client.post("/api/receipts", json={"supplier": "S1", "product_id": product_id, "warehouse_id": 1, "quantity": 100}, headers=auth_headers)

    response = client.post("/api/transfers", json={
        "product_id": product_id,
        "from_warehouse": 1,
        "to_warehouse": 2,
        "quantity": 40
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json["status"] == "success"

    from models.inventory_model import Inventory
    with app.app_context():
        inv1 = Inventory.query.filter_by(product_id=product_id, warehouse_id=1).first()
        inv2 = Inventory.query.filter_by(product_id=product_id, warehouse_id=2).first()
        assert inv1.quantity == 60
        assert inv2.quantity == 40
