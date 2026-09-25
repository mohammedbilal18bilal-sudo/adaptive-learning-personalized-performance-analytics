#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py change_course_id
python manage.py reset_progress_ids
python manage.py create_demo_users
python manage.py collectstatic --no-input
