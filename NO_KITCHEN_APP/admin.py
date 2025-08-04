from django.contrib import admin
from .models import Food,Subscription,Cart,CartItem,CartPayment,Payment,Contact,Profile

# Register your models here.
admin.site.register(Food),
admin.site.register(Subscription),
admin.site.register(Cart),
admin.site.register(CartItem),
admin.site.register(Payment),
admin.site.register(CartPayment),
admin.site.register(Profile),
admin.site.register(Contact),




from django.contrib import admin
from .models import DeliveryConfig

from django.contrib import admin
from .models import DeliveryConfig

@admin.register(DeliveryConfig)
class DeliveryConfigAdmin(admin.ModelAdmin):
    list_display = ('store_latitude', 'store_longitude', 'api_key')
    search_fields = ('api_key',)
    list_filter = ('store_latitude', 'store_longitude')


# admin.py

from django.contrib import admin
from .models import StoreLocation

@admin.register(StoreLocation)
class StoreLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
