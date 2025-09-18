from django.urls import path
from . import views   # using views.py since APIs are inside there now

urlpatterns = [
    path("send-otp/", views.SendOtpAPI.as_view(), name="send-otp"),
    path("verify-otp/", views.VerifyOtpAPI.as_view(), name="verify-otp"),
]
