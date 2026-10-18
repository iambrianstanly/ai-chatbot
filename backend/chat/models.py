import uuid
from django.db import models


class Session(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255, default="New Conversation")
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name="messages",
        db_column="session_id",
        null=True
    )
    role = models.CharField(max_length=50, null=True, blank=True)  # user or assistant
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

