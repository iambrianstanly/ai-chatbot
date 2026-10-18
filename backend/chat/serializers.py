from rest_framework import serializers
from typing import List, Optional
import datetime
from .models import Session

class MessageSerializer(serializers.Serializer):
    """Serializer for a single chat message."""
    role = serializers.CharField()
    content = serializers.CharField()

class ChatRequestSerializer(serializers.Serializer):
    """Serializer for the request payload sent to the chat endpoint."""
    messages = MessageSerializer(many=True)

class MessageInputSerializer(serializers.Serializer):
    """Serializer for a single chat message."""
    message = serializers.CharField(required=True)


class SessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new conversation."""
    class Meta:
        model = Session
        fields = ["session_id", "title", "created_at"]
        read_only_fields = ["session_id", "created_at"]


class SessionResponseSerializer(serializers.Serializer):
    """Serializer for returning conversation details."""
    id = serializers.CharField()
    title = serializers.CharField()
    created_at = serializers.DateTimeField()


# Deprecated Pydantic serializer definitions removed
