# Eliana Cinema Backend

This is the backend for the Eliana Cinema application, built with Django and Django REST Framework.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd eliana-cinema/backend
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file:**
    Copy the `.env.example` file to `.env` and fill in your sensitive information. Make sure to generate a strong `SECRET_KEY`.
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file:
    ```
    SECRET_KEY=your_secret_key_here
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
    CORS_ALLOW_CREDENTIALS=True
    TELEBIRR_APP_ID=your_app_id
    TELEBIRR_APP_KEY=your_app_key
    TELEBIRR_SHORT_CODE=your_short_code
    TELEBIRR_API_URL=https://api.telebirr.com/
    TELEBIRR_PUBLIC_KEY=your_public_key
    ```

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser (optional, for admin access):**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Collect static files:**
    ```bash
    python manage.py collectstatic
    ```

## Running the Development Server

```bash
python manage.py runserver
```

## Deployment with Gunicorn

For production, use Gunicorn to serve the application.

```bash
# Ensure your virtual environment is activated
gunicorn eliana.wsgi:application --bind 0.0.0.0:8000
```

This will start Gunicorn on port 8000. You would typically use a reverse proxy like Nginx in front of Gunicorn to handle static files, SSL, and load balancing.

## Important Notes for Production

*   **Database:** The current setup uses SQLite, which is not recommended for production environments. Consider using a robust database like PostgreSQL.
*   **DEBUG:** Set `DEBUG=False` in your `.env` file for production.
*   **ALLOWED_HOSTS:** Configure `ALLOWED_HOSTS` in your `.env` file with your production domain names.
*   **CORS_ALLOWED_ORIGINS:** Set this to your frontend's production URL.
*   **Static and Media Files:** In a production environment, a web server (e.g., Nginx) should be configured to serve static and media files directly. Django will not serve these files in production.
*   **Logging:** Basic logging is configured to output to console and a file (`logs/django.log`). Ensure your production environment handles log rotation and storage appropriately.
