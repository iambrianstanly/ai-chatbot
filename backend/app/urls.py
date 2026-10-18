from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger schema view configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Chatbot API",
        default_version='v1',
        description="API documentation for the chatbot project",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Redirect root URL to Swagger UI
    path('', RedirectView.as_view(url='api/docs/', permanent=False)),
    path('api/', include('chat.urls')),
    # Swagger UI endpoint (optional direct access)
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
]

