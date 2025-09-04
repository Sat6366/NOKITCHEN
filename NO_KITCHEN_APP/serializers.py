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




# react end point serizilers

from rest_framework import serializers
from .models import StoreLocation, DeliveryPartner

class StoreLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreLocation
        # use your real fields from the model:
        fields = ["id", "name", "latitude", "longitude", "city", "status", "is_active"]

class DeliveryPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPartner
        fields = "__all__"
        read_only_fields = ["agent_code", "created_at", "updated_at", "registered_on"]



from rest_framework import serializers

class SendOtpSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)


class VerifyOtpSerializer(serializers.Serializer):
    session_id = serializers.CharField()
    otp = serializers.CharField(max_length=6)
