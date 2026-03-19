from models.delivery_model import Delivery
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService

class DeliveryService:
    @staticmethod
    def _normalize_items(data):
        if data.get("items"):
            return data["items"]
        if all(key in data for key in ("product_id", "quantity")):
            return [{
                "product_id": data["product_id"],
                "quantity": data["quantity"],
            }]
        return None

    @staticmethod
    def get_all():
        deliveries = Delivery.query.all()
        return [d.to_dict() for d in deliveries]

    @staticmethod
    def get_by_id(delivery_id):
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found")
        return delivery.to_dict()

    @staticmethod
    def create(data):
        if not data:
            raise ValueError("Missing required field: customer")
        if "customer" not in data:
            raise ValueError("Missing required field: customer")
        items = DeliveryService._normalize_items(data)
        if not items:
            raise ValueError("Missing required field: product_id")
        warehouse_id = data.get("warehouse_id")

        delivery = Delivery(customer=data["customer"], status="done" if warehouse_id else "draft")
        db.session.add(delivery)
        db.session.flush()

        from models.delivery_model import DeliveryItem
        total_quantity = 0
        for item in items:
            if item["quantity"] <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {item.get('product_id')}")
            di = DeliveryItem(
                delivery_id=delivery.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            )
            db.session.add(di)
            total_quantity += item["quantity"]

            if warehouse_id:
                inventory = Inventory.query.filter_by(
                    product_id=item["product_id"],
                    warehouse_id=warehouse_id
                ).first()
                if not inventory or inventory.quantity < item["quantity"]:
                    raise ValueError(f"Not enough stock for product {item['product_id']} in warehouse {warehouse_id}")
                inventory.quantity -= item["quantity"]
                LedgerService.log_transaction(
                    product_id=item["product_id"],
                    warehouse_id=warehouse_id,
                    operation_type="delivery",
                    quantity_change=-item["quantity"],
                    reference_id=delivery.id
                )

        db.session.commit()
        result = Delivery.query.get(delivery.id).to_dict()
        if len(items) == 1:
            result["product_id"] = items[0]["product_id"]
            result["quantity"] = items[0]["quantity"]
            result["warehouse_id"] = warehouse_id
        else:
            result["quantity"] = total_quantity
            result["warehouse_id"] = warehouse_id
        return result

    @staticmethod
    def validate(delivery_id, warehouse_id):
        delivery = Delivery.query.get(delivery_id)
        if not delivery:
            raise ValueError("Delivery not found")
        
        if delivery.status == "done":
            raise ValueError("Delivery is already validated")

        from models.inventory_model import Inventory
        # Check stock first
        for item in delivery.items:
            inventory = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=warehouse_id
            ).first()

            if not inventory or inventory.quantity < item.quantity:
                raise ValueError(f"Not enough stock for product {item.product_id} in warehouse {warehouse_id}")

        delivery.status = "done"

        # Deduct stock and log
        for item in delivery.items:
            inventory = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=warehouse_id
            ).first()

            inventory.quantity -= item.quantity

            LedgerService.log_transaction(
                product_id=item.product_id,
                warehouse_id=warehouse_id,
                operation_type="delivery",
                quantity_change=-item.quantity,
                reference_id=delivery.id
            )

        db.session.commit()
        return delivery.to_dict()
