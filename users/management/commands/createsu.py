from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()

class Command(BaseCommand):
    help = "Create a superuser if none exists"

    def handle(self, *args, **options):
        admin_email = config("DJANGO_SUPERUSER_EMAIL", default="admin@example.com")
        admin_username = config("DJANGO_SUPERUSER_USERNAME", default="admin")
        admin_password = config("DJANGO_SUPERUSER_PASSWORD", default="admin123")

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                username=admin_username,
                password=admin_password,
                role="admin"
            )
            self.stdout.write(self.style.SUCCESS(f"Superuser {admin_email} created"))
        else:
            self.stdout.write(self.style.WARNING("Superuser already exists"))
