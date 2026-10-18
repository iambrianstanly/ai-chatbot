import logging
from django.views.generic import View
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema

from chat.services.llm_service import get_chat_response
from .serializers import (
    MessageInputSerializer, 
    SessionCreateSerializer,
    MessageSerializer
)
from .models import Message, Session

logger = logging.getLogger(__name__)

class SessionCreateView(CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionCreateSerializer

class SessionListView(ListAPIView):
    queryset = Session.objects.all().order_by('-created_at')
    serializer_class = SessionCreateSerializer


class ChatView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


    @swagger_auto_schema(
        request_body=MessageInputSerializer,
        responses={200: "ok"}
    )
    def post(self, request, session_id):

        serializer = MessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]

        try:
            session = Session.objects.get(session_id=session_id)
            
            # Save the user's new message to the database
            Message.objects.create(
                session=session,
                role="user",
                content=message
            )

            # Retrieve the full conversation history (including the new message)
            messages = Message.objects.filter(session=session).order_by('created_at')
            
            # Pass the history to LangChain
            response = get_chat_response(messages)

            # Save the AI's response to the database
            Message.objects.create(
                session=session,
                role="assistant",
                content=response
            )
            return Response({"reply": response})

        except Session.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)

        except Exception as exc:
            logger.exception("Chat completion failed")
            return Response({"error": str(exc)}, status=502)

    @swagger_auto_schema(
        response={
            200: "Resource deleted"
        }
    )
    def delete(self, request, session_id):

        try:
            session = Session.objects.all().filter(session_id=session_id)
            session.delete()
            return Response({"reply": "Session deleted"}, status=200)

        except Exception as exc:
            return Response({"error": str(exc)}, status=400)

    @swagger_auto_schema(
        responses={200: MessageSerializer(many=True)}
    )
    def get(self, request, session_id):

        try:
            session = Session.objects.get(session_id=session_id)
            messages = Message.objects.filter(session=session).order_by('created_at')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=200)

        except Session.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)

        except Exception as exc:
            return Response({"error": str(exc)}, status=400)
