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
