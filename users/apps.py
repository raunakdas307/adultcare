from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate
from django.contrib.auth import get_user_model

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        from django.core.management import call_command

        def create_admin(sender, **kwargs):
            try:
                call_command("createsu")
            except Exception as e:
                print(f"Error creating superuser: {e}")

        post_migrate.connect(create_admin, sender=self)
