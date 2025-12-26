from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from .serializers import AccountSidebarSerializer
from accounts.models import Account
from .models import ChatRoom, ChatMessage
from .serializers import ChatMessageSerializer


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_sidebar_customers(request):
    customers = Account.objects.filter(customer_room__isnull=False).distinct()
    data = AccountSidebarSerializer(customers, many=True).data
    return Response({"customers": data})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_get_messages(request, customer_id):
    try:
        room = ChatRoom.objects.get(customer_id=customer_id)
    except ChatRoom.DoesNotExist:
        return Response({"messages": []}, status=200)

    messages = ChatMessage.objects.filter(room=room).order_by("created_at")
    data = ChatMessageSerializer(messages, many=True).data
    return Response({"room_id": room.id, "messages": data})

@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_send_message(request, room_id):
    text = request.data.get("message", "").strip()
    if not text:
        return Response({"error": "Message is required"}, status=400)

    room = ChatRoom.objects.get(id=room_id)

    msg = ChatMessage.objects.create(
        room=room,
        sender=request.user,
        message=text,
    )

    return Response(ChatMessageSerializer(msg).data, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_get_messages(request):
    room, _ = ChatRoom.objects.get_or_create(
        customer=request.user,
        defaults={"admin": None}
    )

    messages = ChatMessage.objects.filter(room=room).order_by("created_at")
    data = ChatMessageSerializer(messages, many=True).data
    return Response({"room_id": room.id, "messages": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_send_message(request, room_id):
    text = request.data.get("message", "").strip()
    if not text:
        return Response({"error": "Message is required"}, status=400)

    room = ChatRoom.objects.get(id=room_id)

    msg = ChatMessage.objects.create(
        room=room,
        sender=request.user,
        message=text,
    )

    return Response(ChatMessageSerializer(msg).data, status=201)
