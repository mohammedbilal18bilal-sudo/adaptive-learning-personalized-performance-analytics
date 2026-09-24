# Adaptive Learning and Personalized Student Performance Analytics

A Django REST Framework backend for an Adaptive Learning Platform designed to manage courses, lessons, assessments, questions, student progress, user profiles, and assessment attempts.

## Project Overview

The system provides a backend API for personalized learning and student performance tracking. It uses JWT authentication and role-based permissions to support different types of users.

## Key Features

- JWT-based user authentication
- Course management
- Lesson management
- Student progress tracking
- User profile management
- Assessment management
- Question management
- Assessment attempt tracking
- Role-based permissions for Student, Faculty, and Admin users
- RESTful API endpoints

## My Contribution – Backend Development

- Developed REST APIs using Django REST Framework.
- Implemented JWT authentication and role-based permissions.
- Created database models, serializers, and migrations.
- Tested backend API endpoints.

## Technologies Used

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite – Local development database
- PostgreSQL – Production database
- python-dotenv – Environment variable management
- Gunicorn – Application server
- WhiteNoise – Static file serving
- Git & GitHub – Version control
- Postman – API testing
- Render – Cloud deployment

## Project Structure

```text
adaptive-learning-platform/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── __init__.py
│
├── core/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── tests.py
│   └── __init__.py
│
├── screenshots/
├── manage.py
├── requirements.txt
├── build.sh
├── .gitignore
└── README.md
