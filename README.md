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

## Technologies Used

- Python
- Django
- Django REST Framework
- SQLite
- Simple JWT
- python-dotenv

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
├── screenshot/
├── manage.py
├── requirements.txt
├── .gitignore
└── README.md
