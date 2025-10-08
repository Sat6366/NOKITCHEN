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
from .models import DeliveryPartner, StoreLocation  # import your Store model

from rest_framework import serializers
from .models import DeliveryPartner, StoreLocation

class StoreLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreLocation
        fields = ['id', 'name', 'city', 'address', 'status']

class DeliveryPartnerSerializer(serializers.ModelSerializer):
    selfie = serializers.SerializerMethodField()
    selected_store = StoreLocationSerializer(read_only=True)

    class Meta:
        model = DeliveryPartner
        # ✅ Removed gender & dob because they don't exist in model
        fields = [
            'id',
            'first_name',
            'last_name',
            'mobile',
            'selfie',
            'agent_code',
            'email',
            'is_online',
            'registered_on',
            'selected_store',
        ]

    def get_selfie(self, obj):
        request = self.context.get('request')
        if obj.selfie:
            return request.build_absolute_uri(obj.selfie.url)
        return None


from rest_framework import serializers
from .models import DeliveryPartner

class SendOtpSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)

class VerifyOtpSerializer(serializers.Serializer):
    session_id = serializers.CharField()
    otp = serializers.CharField(max_length=6)

from rest_framework import serializers
from .models import DeliveryPartner

class DeliveryPartnerSerializer(serializers.ModelSerializer):
    selfie = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryPartner
        # Added 'id' here
        fields = ['id', 'first_name', 'last_name', 'mobile', 'selfie', 'agent_code']

    def get_selfie(self, obj):
        request = self.context.get('request')
        if obj.selfie:
            return request.build_absolute_uri(obj.selfie.url)
        return None



# NO_KITCHEN_APP/serializers.py
from rest_framework import serializers

class ToggleOnlineSerializer(serializers.Serializer):
    agent_code = serializers.CharField(max_length=50)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()

class LiveLocationSerializer(serializers.Serializer):
    agent_code = serializers.CharField(max_length=50)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
