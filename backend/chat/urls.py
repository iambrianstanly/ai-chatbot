from django.urls import path
from .views import ChatView, SessionCreateView, SessionListView

urlpatterns = [
    path('v1/session/list/', SessionListView.as_view(), name='session_list'),
    path('v1/session/create/', SessionCreateView.as_view(), name='session_create'),
    path('v1/session/<session_id>/', ChatView.as_view(), name='chat'),
]


