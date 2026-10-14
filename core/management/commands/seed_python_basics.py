from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Course, Lesson, Assessment, Question


COURSE_TITLE = "Python Basics"
COURSE_DESCRIPTION = (
    "Beginner-friendly Python course covering Python introduction, variables and data types, "
    "operators, conditional statements, loops, and functions. Includes worked examples, "
    "practice activities, and the Python Basic Quiz from the supplied course materials."
)

LESSONS = [
    {
        "title": "Introduction to Python",
        "difficulty": 1,
        "content": """PYTHON BASICS — LESSON 1: INTRODUCTION TO PYTHON

LEARNING OBJECTIVES
- Define Python and identify common uses.
- Use print() and input() in a simple program.
- Understand indentation, comments, and common error types.

1. CORE CONCEPT
Python is a high-level, general-purpose programming language with readable syntax. It is used for scripting, web development, automation, data analysis, scientific computing, and machine learning. A Python source file commonly uses the .py extension.

2. IMPORTANT CONCEPTS
- The Python interpreter executes Python statements.
- print(value) displays output.
- input(prompt) reads user input and returns it as a string.
- Indentation defines the blocks of code under conditions, loops, and functions.
- A comment starts with # and is ignored by the interpreter.
- A syntax error breaks Python's grammar; a runtime error occurs while the program runs; a logic error produces an incorrect result even though the program runs.

3. WORKED EXAMPLE
print('Hello, world!')
name = input('Enter your name: ')
print('Hello,', name)

The first line displays a greeting. The second reads the user's name as text. The third prints that value with another greeting.

4. COMMON MISTAKES AND GOOD PRACTICE
- Check spelling, brackets, quotation marks, and colons.
- Use meaningful variable names and consistent indentation.
- Read error messages carefully; fix one issue at a time.
- Test a program with more than one input when possible.

QUICK REVISION
Python has readable syntax; print() displays output; input() returns text; indentation defines blocks; comments begin with #.

PRACTICE QUESTIONS
1. Define Python and list two uses.
2. Explain print() and input().
3. Differentiate syntax errors, runtime errors, and logic errors.
4. Write a program that asks for a name and prints a greeting.

SELF-CHECK
Run the example, change the greeting and try a different name. Explain why the displayed output changes.""",
    },
    {
        "title": "Variables and Data Types",
        "difficulty": 1,
        "content": """PYTHON BASICS — LESSON 2: VARIABLES AND DATA TYPES

LEARNING OBJECTIVES
- Store values in variables.
- Recognize common built-in data types.
- Use type() and convert suitable input values.

1. CORE CONCEPT
A variable is a name that refers to a value. A data type describes the kind of value and the operations that can be performed on it.

2. IMPORTANT CONCEPTS
- int: whole numbers, such as 86.
- float: decimal numbers, such as 86.5.
- str: text, such as 'Asha'.
- bool: True or False.
- list: ordered and mutable collection.
- tuple: ordered and immutable collection.
- dict: key-value pairs.
- set: unique values.
- type(value) reports a value's type. int(), float(), and str() convert suitable values.
- Variable names cannot begin with a digit, are case-sensitive, and cannot be Python keywords. Use underscores instead of spaces or hyphens.
- input() returns text, so numeric input may need conversion.

3. WORKED EXAMPLE
name = 'Asha'
marks = 86
percentage = 86.5
passed = True
print(type(marks))

The variables store text, an integer, a decimal number, and a Boolean value. type(marks) identifies marks as an integer.

4. INPUT CONVERSION EXAMPLE
age_text = input('Enter your age: ')
age = int(age_text)
print(age + 1)

This example assumes the user enters a whole number. Non-numeric text would cause a conversion error.

5. COMMON MISTAKES AND GOOD PRACTICE
- Do not start a variable name with a number.
- Remember that 'marks' and 'Marks' are different names.
- Do not assume input() automatically returns a number.
- Choose meaningful names and check the expected type before doing calculations.

QUICK REVISION
int = whole number; float = decimal; str = text; bool = True/False; list = mutable; tuple = immutable; dict = key-value pairs; set = unique values.

PRACTICE QUESTIONS
1. State the rules for naming variables.
2. Differentiate int, float, str, and bool.
3. Differentiate a list and a tuple.
4. Explain type conversion with an example.

SELF-CHECK
Create one variable of each type shown above and print its value and type.""",
    },
    {
        "title": "Operators",
        "difficulty": 1,
        "content": """PYTHON BASICS — LESSON 3: OPERATORS

LEARNING OBJECTIVES
- Use arithmetic, comparison, logical, assignment, and membership operators.
- Understand floor division, remainder, and operator precedence.

1. CORE CONCEPT
Operators perform calculations, compare values, combine conditions, assign values, or test membership and identity.

2. IMPORTANT CONCEPTS
- Arithmetic: +, -, *, /, //, %, **.
- Comparison: ==, !=, >, <, >=, <=.
- Logical: and, or, not.
- Assignment: =, +=, -=, *=.
- Membership: in and not in.
- == compares values; is checks object identity.
- / performs ordinary division; // performs floor division; % returns the remainder; ** raises a number to a power.
- Multiplication and division are evaluated before addition and subtraction unless parentheses change the order.

3. WORKED EXAMPLE
a = 10
b = 3
print(a // b)   # 3
print(a % b)    # 1
print(2 + 3 * 4)  # 14
print(5 >= 3)   # True

4. EXPLANATION
10 // 3 gives the floor-division result 3. 10 % 3 gives remainder 1. In 2 + 3 * 4, multiplication happens first, so the answer is 14. The comparison 5 >= 3 evaluates to a Boolean value.

5. COMMON MISTAKES AND GOOD PRACTICE
- Use == to compare values; a single = assigns a value.
- Do not confuse / and //.
- Use parentheses when they make an expression clearer.
- Use 'in' to test whether a value occurs in a collection.

QUICK REVISION
Arithmetic operators calculate; comparison operators return True/False; logical operators combine conditions; assignment operators update values; membership operators test inclusion.

PRACTICE QUESTIONS
1. Differentiate / and //.
2. Explain and, or, and not.
3. Evaluate 2 + 3 * 4 and show the order of operations.
4. Differentiate == and is.

SELF-CHECK
Change a and b to different integers and predict the results of // and % before running the code.""",
    },
    {
        "title": "Conditional Statements",
        "difficulty": 2,
        "content": """PYTHON BASICS — LESSON 4: CONDITIONAL STATEMENTS

LEARNING OBJECTIVES
- Make decisions using if, elif, and else.
- Write correctly indented conditional blocks.
- Understand the importance of condition order.

1. CORE CONCEPT
Conditional statements select which block of code runs based on whether a condition evaluates to True or False.

2. IMPORTANT CONCEPTS
- if executes a block when its condition is true.
- elif checks another condition if the earlier conditions were false.
- else handles the remaining case when no prior condition matched.
- Nested if statements place a conditional inside another conditional.
- A colon follows the condition, and the block must be indented consistently.
- Conditions should be arranged carefully so that valid branches are not made unreachable by earlier branches.

3. WORKED EXAMPLE
marks = 78
if marks >= 90:
    grade = 'A'
elif marks >= 75:
    grade = 'B'
else:
    grade = 'Needs improvement'
print(grade)

For marks equal to 78, the first condition is false and the elif condition is true, so the program prints B.

4. ANOTHER EXAMPLE: EVEN OR ODD
number = 7
if number % 2 == 0:
    print('Even')
else:
    print('Odd')

The remainder operator checks whether the number divides evenly by 2.

5. COMMON MISTAKES AND GOOD PRACTICE
- Include the colon after if, elif, and else.
- Indent the statements inside each branch.
- Use comparison operators such as == or >= when testing a condition.
- Put more specific or higher-threshold conditions before broader conditions when needed.

QUICK REVISION
if checks a condition; elif checks additional conditions; else handles the remaining case; indentation and colons are essential.

PRACTICE QUESTIONS
1. Explain if-else with an example.
2. Write a program to check whether a number is even or odd.
3. Write a grade program using elif.
4. What is a nested if statement?

SELF-CHECK
Change marks to 65, 80, and 95 and verify which branch runs for each value.""",
    },
    {
        "title": "Loops",
        "difficulty": 2,
        "content": """PYTHON BASICS — LESSON 5: LOOPS

LEARNING OBJECTIVES
- Repeat instructions using for and while loops.
- Understand range(), break, and continue.
- Avoid accidental infinite loops.

1. CORE CONCEPT
Loops repeat statements to process sequences, count values, and repeat work while a condition remains true.

2. IMPORTANT CONCEPTS
- for iterates through a sequence or another iterable.
- while repeats as long as its condition is true.
- range(stop) starts at 0 and excludes stop; range(start, stop) excludes stop as well.
- break exits the nearest loop.
- continue skips the remaining statements in the current iteration and moves to the next iteration.
- A while loop needs a stopping condition that will eventually become false.

3. WORKED EXAMPLE: FOR LOOP
for i in range(1, 6):
    print(i)

This prints 1, 2, 3, 4, and 5. The stop value 6 is not included.

4. WORKED EXAMPLE: WHILE LOOP
count = 1
while count <= 3:
    print(count)
    count += 1

The counter increases each time, so the condition eventually becomes false. The loop prints 1, 2, and 3.

5. COMMON MISTAKES AND GOOD PRACTICE
- Remember that range() excludes its stop value.
- Update the variable used by a while-loop condition when appropriate.
- Check indentation carefully.
- Use break and continue only when their control-flow effect is clear.

QUICK REVISION
for iterates through a sequence; while repeats based on a condition; break exits; continue skips to the next iteration.

PRACTICE QUESTIONS
1. Differentiate for and while.
2. What values are produced by range(1, 5)?
3. Explain break and continue.
4. Print the numbers from 1 to 10 using a loop.

SELF-CHECK
Run both examples and explain why each loop stops.""",
    },
    {
        "title": "Functions",
        "difficulty": 2,
        "content": """PYTHON BASICS — LESSON 6: FUNCTIONS

LEARNING OBJECTIVES
- Define and call a function.
- Distinguish parameters from arguments.
- Return results from a function.

1. CORE CONCEPT
A function is a named, reusable block of code that performs a specific task. Functions reduce repetition and make programs easier to test, read, and maintain.

2. IMPORTANT CONCEPTS
- def begins a function definition.
- Parameters are names listed in a function definition.
- Arguments are the actual values supplied when calling a function.
- return sends a result back to the caller.
- print() displays a value; return makes a value available to the calling code.
- A function body must be indented.

3. WORKED EXAMPLE

def add(a, b):
    return a + b

result = add(4, 6)
print(result)  # 10

Here a and b are parameters. The values 4 and 6 are arguments. The function returns 10, which is stored in result and then printed.

4. ANOTHER EXAMPLE

def larger(x, y):
    if x > y:
        return x
    return y

print(larger(8, 5))  # 8

5. COMMON MISTAKES AND GOOD PRACTICE
- Use def and a colon in the function definition.
- Indent the function body consistently.
- Call the function by its name and provide the required arguments.
- Do not confuse printing a value with returning a value.

QUICK REVISION
def defines a function; parameters appear in the definition; arguments are passed in a call; return sends a value back.

PRACTICE QUESTIONS
1. Differentiate parameters and arguments.
2. Differentiate print() and return.
3. Write a function that finds the larger of two numbers.
4. Write a function that returns the square of a number.

SELF-CHECK
Write an add() function, call it with two different pairs of values, and verify the results.""",
    },
]

# Question format: question text, options A-D, correct option letter.
# The questions and key follow the supplied "Python Basic Quiz" PDF.
# The supplied PDF has a blank C option for question 22; the placeholder below
# makes that missing option visible rather than silently inventing an answer.
QUIZ_QUESTIONS = [
    ("Which function displays output?", "input()", "print()", "type()", "len()", "B"),
    ("Which is a valid variable name?", "2marks", "student-name", "student_name", "class", "C"),
    ("What is the type of 8.5?", "int", "float", "str", "bool", "B"),
    ("What does int('12') return?", "'12'", "12.0", "12", "None", "C"),
    ("What is 10 // 3?", "3.33", "3", "1", "0", "B"),
    ("Which operator checks equality?", "=", "==", ":=", "!=", "B"),
    ("True and False evaluates to:", "True", "False", "None", "Error", "B"),
    ("Which keyword begins a conditional?", "when", "if", "check", "then", "B"),
    ("Which keyword checks another condition?", "elseif", "else if", "elif", "next", "C"),
    ("range(1, 5) produces:", "1 to 5", "0 to 4", "1 to 4", "2 to 5", "C"),
    ("Which loop commonly iterates over a list?", "for", "switch", "select", "repeat-until", "A"),
    ("An infinite while loop may occur when:", "condition never becomes false", "print is used", "comment is added", "variable has a name", "A"),
    ("Which statement exits the nearest loop?", "skip", "continue", "break", "stop", "C"),
    ("Which keyword defines a function?", "function", "def", "fun", "define", "B"),
    ("return:", "displays every variable", "sends a result to caller", "imports a module", "restarts Python", "B"),
    ("len('Python') returns:", "5", "6", "7", "Error", "B"),
    ("Which collection is mutable?", "tuple", "string", "list", "integer", "C"),
    ("Which operator tests membership?", "is", "in", "==", "//", "B"),
    ("2 + 3 * 4 equals:", "20", "14", "24", "9", "B"),
    ("5 >= 3 returns a value of type:", "int", "str", "bool", "list", "C"),
    ("input() returns by default:", "int", "float", "str", "bool", "C"),
    ("Which is a Python comment?", "// comment", "# comment", "(blank in provided quiz)", "** comment", "B"),
    ("[1,2,3][0] returns:", "0", "1", "2", "3", "B"),
    ("Which keyword checks alternatives after if?", "elif", "repeat", "select", "until", "A"),
    ("Functions are useful because they:", "always lengthen code", "prevent all errors", "support reuse and organization", "replace variables", "C"),
]


class Command(BaseCommand):
    help = "Bulk-import or update Python Basics lessons and its 25-question quiz."

    @transaction.atomic
    def handle(self, *args, **options):
        # Upsert only Python Basics; other courses are not touched.
        course = Course.objects.filter(title=COURSE_TITLE).order_by("id").first()
        created_course = course is None
        if created_course:
            course = Course.objects.create(
                title=COURSE_TITLE,
                description=COURSE_DESCRIPTION,
            )
        else:
            course.description = COURSE_DESCRIPTION
            course.save(update_fields=["description"])

        lesson_created = 0
        lesson_updated = 0

        for index, item in enumerate(LESSONS, start=1):
            lesson = (
                Lesson.objects
                .filter(course=course, title=item["title"])
                .order_by("id")
                .first()
            )
            if lesson is None:
                Lesson.objects.create(
                    course=course,
                    title=item["title"],
                    content=item["content"],
                    difficulty=item["difficulty"],
                    order=index,
                )
                lesson_created += 1
            else:
                lesson.content = item["content"]
                lesson.difficulty = item["difficulty"]
                lesson.order = index
                lesson.save(update_fields=["content", "difficulty", "order"])
                lesson_updated += 1

        # Reuse this course's existing quiz if the previous bulk seed created it.
        assessment = (
            Assessment.objects
            .filter(course=course, title="Python Basic Quiz")
            .order_by("id")
            .first()
        )
        if assessment is None:
            assessment = (
                Assessment.objects
                .filter(course=course, title="Python Basics - Knowledge Check")
                .order_by("id")
                .first()
            )

        assessment_created = assessment is None
        if assessment is None:
            assessment = Assessment.objects.create(
                course=course,
                title="Python Basic Quiz",
                description=(
                    "25 multiple-choice questions from the provided Python Basic Quiz. "
                    "Each question carries 4 marks. Total: 100 marks; duration: 30 minutes."
                ),
                total_marks=100,
                duration_minutes=30,
            )
        else:
            assessment.title = "Python Basic Quiz"
            assessment.description = (
                "25 multiple-choice questions from the provided Python Basic Quiz. "
                "Each question carries 4 marks. Total: 100 marks; duration: 30 minutes."
            )
            assessment.total_marks = 100
            assessment.duration_minutes = 30
            assessment.save(update_fields=[
                "title", "description", "total_marks", "duration_minutes"
            ])

        questions_created = 0
        questions_updated = 0
        desired_texts = []

        for question_text, option_a, option_b, option_c, option_d, correct_option in QUIZ_QUESTIONS:
            desired_texts.append(question_text)
            question = (
                Question.objects
                .filter(assessment=assessment, question_text=question_text)
                .order_by("id")
                .first()
            )
            defaults = {
                "option_a": option_a,
                "option_b": option_b,
                "option_c": option_c,
                "option_d": option_d,
                "correct_option": correct_option,
                "marks": 4,
                "difficulty": 1,
            }
            if question is None:
                Question.objects.create(
                    assessment=assessment,
                    question_text=question_text,
                    **defaults,
                )
                questions_created += 1
            else:
                for field, value in defaults.items():
                    setattr(question, field, value)
                question.save(update_fields=list(defaults.keys()))
                questions_updated += 1

        # Remove stale questions only from this specific Python Basic Quiz so it
        # matches the provided 25-question source. Assessment attempts are kept.
        stale_questions = Question.objects.filter(assessment=assessment).exclude(
            question_text__in=desired_texts
        )
        stale_count, _ = stale_questions.delete()

        self.stdout.write(self.style.SUCCESS("Python Basics import complete."))
        self.stdout.write(f"Course: {course.title} (id={course.id}; {'created' if created_course else 'updated'})")
        self.stdout.write(
            f"Lessons: {len(LESSONS)} total; {lesson_created} created; {lesson_updated} updated."
        )
        self.stdout.write(
            f"Assessment: {assessment.title} (id={assessment.id}; {'created' if assessment_created else 'updated'}); "
            "100 marks; 30 minutes."
        )
        self.stdout.write(
            f"Questions: {len(QUIZ_QUESTIONS)} total; {questions_created} created; "
            f"{questions_updated} updated; {stale_count} outdated question record(s) removed from this quiz."
        )
        self.stdout.write(
            "No other courses, StudentProgress records, or AssessmentAttempt records were deleted or reset."
        )
