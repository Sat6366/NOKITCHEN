# NO_kitchen_app/utils.py

from django.contrib.contenttypes.models import ContentType
from .models import PreparationStatus

def create_preparation_status(order_instance, meal_type, delivery_date, delivery_time):
    """
    Creates a PreparationStatus entry for the given order instance.
    """
    content_type = ContentType.objects.get_for_model(order_instance.__class__)
    return PreparationStatus.objects.create(
        content_type=content_type,
        object_id=order_instance.id,
        meal_type=meal_type,
        date=delivery_date,
        time=delivery_time,
        status='queued'
    )





from django.conf import settings
import requests

def get_location_info(ip_address):
    token = settings.IPINFO_TOKEN
    url = f"https://ipinfo.io/{ip_address}?token={token}"
    response = requests.get(url)
    return response.json()


# your_app/utils.py
from django.utils import timezone
from .models import OrderAssignment, DeliveryPartner

def assign_pending_orders():
    """
    Automatically assign all pending orders to online & available delivery partners.
    """
    pending_orders = OrderAssignment.objects.filter(status='pending')

    # Get all online partners
    online_partners = list(DeliveryPartner.objects.filter(is_online=True))

    if not online_partners:
        print("⚠️ No online delivery partners available right now.")
        return

    for order in pending_orders:
        if not order.delivery_partner:
            # Assign a partner in round-robin fashion
            partner = online_partners.pop(0)
            order.assign_partner(partner)
            print(f"✅ Order #{order.id} assigned to {partner.first_name} {partner.last_name}")
            # Re-add partner to the end of the list
            online_partners.append(partner)
