from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, profile_view, submit_feedback, create_cashfree_order

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", profile_view, name="profile"),
    path("feedback/submit/", submit_feedback, name="submit_feedback"),
    path("create-cashfree-order/", create_cashfree_order, name="create_cashfree_order"),

    # JWT login/logout
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
