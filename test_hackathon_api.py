import os
import sys

# Ensure backend package can be imported for models if needed, 
# but this test script will act as an API client using Flask test_client
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app import create_app
from extensions.db import db
import unittest
import json

class HackathonAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_workflow(self):
        # 1. Register and Login to get JWT
        res = self.client.post("/api/auth/register", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "role": "manager"
        })
        self.assertEqual(res.status_code, 201)

        res = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)
        token = res.json["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Category and Warehouse
        res = self.client.post("/api/categories", json={"name": "Electronics"}, headers=headers)
        self.assertEqual(res.status_code, 201)
        category_id = res.json["data"]["id"]

        res = self.client.post("/api/warehouses", json={"name": "Main WH", "location": "NYC"}, headers=headers)
        self.assertEqual(res.status_code, 201)
        wh_main_id = res.json["data"]["id"]

        res = self.client.post("/api/warehouses", json={"name": "Backup WH", "location": "LA"}, headers=headers)
        self.assertEqual(res.status_code, 201)
        wh_backup_id = res.json["data"]["id"]

        # 3. Create Product
        res = self.client.post("/api/products", json={
            "name": "Laptop",
            "sku": "LPT-1",
            "category_id": category_id,
            "price": 1000.0,
            "unit": "pcs",
            "reorder_level": 5,
            "quantity": 0 # This usually shouldn't impact actual inventory, but required by old create model maybe? Let's check.
        }, headers=headers)
        # Assuming product_service.create requires basic data. The hackathon spec didn't modify how product_service.py behaves entirely except for the new fields.
        if res.status_code == 400:
           # If old fields are still required:
           res = self.client.post("/api/products", json={
               "name": "Laptop",
               "sku": "LPT-1",
               "category": "RawCategory",
               "price": 1000.0,
               "quantity": 0,
               "category_id": category_id,
               "unit": "pcs",
               "reorder_level": 5
           }, headers=headers)
        self.assertEqual(res.status_code, 201)
        product_id = res.json["data"]["id"]

        # 4. Create and Validate Receipt
        res = self.client.post("/api/receipts", json={
            "supplier": "TechCorp",
            "items": [{"product_id": product_id, "quantity": 50}]
        }, headers=headers)
        if res.status_code != 201:
            print(res.json)
        self.assertEqual(res.status_code, 201)
        receipt_id = res.json["data"]["id"]
        
        # It's in draft state
        res = self.client.get(f"/api/receipts/{receipt_id}", headers=headers)
        self.assertEqual(res.json["data"]["status"], "draft")

        res = self.client.post(f"/api/receipts/{receipt_id}/validate", json={"warehouse_id": wh_main_id}, headers=headers)
        self.assertEqual(res.status_code, 200)

        # 5. Check Inventory from Dashboard Metrics to see if it increased
        res = self.client.get("/api/dashboard", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json["data"]["totalProducts"], 50)

        # 6. Create and Validate Transfer
        res = self.client.post("/api/transfers", json={
            "from_warehouse_id": wh_main_id,
            "to_warehouse_id": wh_backup_id,
            "items": [{"product_id": product_id, "quantity": 10}]
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        transfer_id = res.json["data"]["id"]

        res = self.client.post(f"/api/transfers/{transfer_id}/validate", headers=headers)
        self.assertEqual(res.status_code, 200)

        # 7. Check Dashboard - total should still be 50, but let's check History/Ledger
        res = self.client.get("/api/ledger?type=transfer", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json["data"]), 2) # TRANSFER OUT + TRANSFER IN

        # 8. Create and Validate Delivery
        res = self.client.post("/api/deliveries", json={
            "customer": "John Doe",
            "items": [{"product_id": product_id, "quantity": 15}]
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        delivery_id = res.json["data"]["id"]

        res = self.client.post(f"/api/deliveries/{delivery_id}/validate", json={"warehouse_id": wh_main_id}, headers=headers)
        self.assertEqual(res.status_code, 200)

        # 9. Final Dashboard Check (50 - 15 = 35)
        res = self.client.get("/api/dashboard", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json["data"]["totalProducts"], 35)
        
if __name__ == "__main__":
    unittest.main()
