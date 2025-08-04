# kitchen_app/serializers.py

from rest_framework import serializers
from .models import PreparationStatus

class PreparationStatusSerializer(serializers.ModelSerializer):
    order_type = serializers.SerializerMethodField()
    order_details = serializers.SerializerMethodField()

    class Meta:
        model = PreparationStatus
        fields = ['id', 'order_type', 'order_details', 'meal_type', 'status', 'time']

    def get_order_type(self, obj):
        return obj.content_type.model  # e.g., weeklymealorder

    def get_order_details(self, obj):
        # You can customize this based on the fields you want from each model
        try:
            return {
                "id": obj.content_object.id,
                "user": str(getattr(obj.content_object, 'user', '')),
                "total_price": getattr(obj.content_object, 'total_price', ''),
                "created_at": getattr(obj.content_object, 'created_at', ''),
            }
        except:
            return {"error": "Order object not found"}
