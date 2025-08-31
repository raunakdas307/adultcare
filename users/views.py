from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import uuid, requests

from .models import Feedback, CustomUser
from .serializers import UserRegisterSerializer, UserSerializer, FeedbackSerializer


# ----------- Registration -----------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()   # ✅ must add queryset
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


# ----------- Profile (/me/) -----------
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ----------- Feedback -----------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def submit_feedback(request):
    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        if request.user.is_authenticated:
            serializer.save(user=request.user)
        else:
            serializer.save()
        return Response({"message": "Feedback submitted successfully!"}, status=201)
    return Response(serializer.errors, status=400)


# ----------- Cashfree (unchanged) -----------
@csrf_exempt
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def create_cashfree_order(request):
    headers = {
        "x-api-version": "2022-09-01",
        "x-client-id": "TEST_ID",
        "x-client-secret": "TEST_SECRET",
        "Content-Type": "application/json",
    }

    order_id = "order_" + str(uuid.uuid4())
    data = {
        "orderId": order_id,
        "orderAmount": 100.00,
        "orderCurrency": "INR",
        "customerDetails": {
            "customerId": "cust_001",
            "customerEmail": "test@example.com",
            "customerPhone": "9999999999",
        },
    }

    response = requests.post(
        "https://sandbox.cashfree.com/pg/orders", headers=headers, json=data, timeout=30
    )
    cashfree_response = response.json()
    payment_session_id = cashfree_response.get("payment_session_id")

    if not payment_session_id:
        return JsonResponse(
            {"error": "Payment session not created", "details": cashfree_response},
            status=400,
        )

    return JsonResponse({"payment_session_id": payment_session_id})
