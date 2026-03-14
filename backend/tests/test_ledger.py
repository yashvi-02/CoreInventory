def test_get_ledger(client, auth_headers):
    res = client.post("/api/products", json={"name": "Prod", "sku": "L-01", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    client.post("/api/receipts", json={"supplier": "S1", "product_id": product_id, "warehouse_id": 1, "quantity": 100}, headers=auth_headers)
    client.post("/api/deliveries", json={"customer": "C1", "product_id": product_id, "warehouse_id": 1, "quantity": 20}, headers=auth_headers)

    response = client.get("/api/ledger", headers=auth_headers)
    assert response.status_code == 200
    assert response.json["status"] == "success"
    # Over 2 entries should exist from this workflow combo
    assert len(response.json["data"]) >= 2

def test_get_ledger_by_product(client, auth_headers):
    res = client.post("/api/products", json={"name": "Prod", "sku": "L-02", "category": "C"}, headers=auth_headers)
    product_id = res.json["data"]["id"]
    
    client.post("/api/receipts", json={"supplier": "S1", "product_id": product_id, "warehouse_id": 1, "quantity": 10}, headers=auth_headers)

    response = client.get(f"/api/ledger/product/{product_id}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["change"] == 10
