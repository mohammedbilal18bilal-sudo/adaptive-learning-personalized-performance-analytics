from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Course, Lesson, Assessment, Question


# Imports the three user-provided courses and their auto-graded MCQ sections.
# Idempotent: records are matched by course title, lesson title and assessment/question text.
# Does not delete courses, lessons, questions, progress records, or assessment attempts.
COURSES = [{'title': 'SQL Fundamentals',
  'description': 'SQL querying course covering SELECT/WHERE, sorting and aggregate functions, GROUP '
                 'BY/HAVING, joins, and practice queries.',
  'lessons': [{'title': 'SELECT and WHERE',
               'difficulty': 1,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Retrieve columns from a relational table.\n'
                          '- Filter rows using conditions.\n'
                          '- Handle text patterns, ranges, and NULL values.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'SQL retrieves and manages relational data. SELECT chooses which columns to '
                          'return, FROM identifies the table, and WHERE filters rows.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- SELECT * returns every column.\n'
                          '- AND, OR, and NOT combine or negate conditions.\n'
                          '- IN checks whether a value matches a list.\n'
                          '- BETWEEN checks a range.\n'
                          '- LIKE matches text patterns.\n'
                          '- Use IS NULL to test for NULL values; do not use = NULL.\n'
                          '\n'
                          'EXAMPLE\n'
                          'SELECT name, score\n'
                          'FROM students\n'
                          'WHERE score >= 80;\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Explain SELECT and WHERE.\n'
                          '2. Write a query to find students scoring above 80.\n'
                          '3. How do you find rows with NULL scores?\n'
                          '4. Filter students whose department is in a specified list.\n'},
              {'title': 'Sorting and Aggregate Functions',
               'difficulty': 1,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Sort rows with ORDER BY.\n'
                          '- Summarize data using aggregate functions.\n'
                          '- Remove duplicate output values with DISTINCT.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'ORDER BY sorts query results; aggregate functions summarize a set of rows.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- ASC sorts ascending and is the default in many SQL systems.\n'
                          '- DESC sorts descending.\n'
                          '- COUNT(*) counts rows.\n'
                          '- SUM() totals numeric values.\n'
                          '- AVG() calculates an average.\n'
                          '- MIN() and MAX() find the smallest and largest values.\n'
                          '- DISTINCT removes duplicate values from the selected results.\n'
                          '\n'
                          'EXAMPLE\n'
                          'SELECT name, score\n'
                          'FROM students\n'
                          'ORDER BY score DESC;\n'
                          '\n'
                          'SELECT AVG(score) AS average_score\n'
                          'FROM students;\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Sort scores from highest to lowest.\n'
                          '2. Count the rows in a students table.\n'
                          '3. Calculate the average score.\n'
                          '4. Explain the difference between COUNT(*) and AVG(score).\n'},
              {'title': 'GROUP BY and HAVING',
               'difficulty': 2,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Group rows for aggregate calculations.\n'
                          '- Filter groups using HAVING.\n'
                          '- Distinguish row filtering from group filtering.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'GROUP BY creates groups of rows for aggregate calculations. HAVING filters those '
                          'groups after the aggregate values are calculated.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- WHERE filters individual rows before grouping.\n'
                          '- HAVING filters groups, often using an aggregate condition.\n'
                          '- Multiple columns can define a group.\n'
                          '- ORDER BY can sort the final grouped results.\n'
                          '\n'
                          'EXAMPLE\n'
                          'SELECT subject, AVG(score) AS average_score\n'
                          'FROM students\n'
                          'GROUP BY subject\n'
                          'HAVING AVG(score) > 75;\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Differentiate WHERE and HAVING.\n'
                          '2. Calculate average score by subject.\n'
                          '3. Find groups with more than five records.\n'
                          '4. Explain why an aggregate condition commonly belongs in HAVING.\n'},
              {'title': 'Joins',
               'difficulty': 2,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Combine related data from two tables.\n'
                          '- Understand INNER JOIN and LEFT JOIN.\n'
                          '- Use ON to specify the matching condition.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'A join combines related rows from tables using a matching condition, commonly a '
                          'shared key.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- INNER JOIN returns only matching rows.\n'
                          '- LEFT JOIN retains all rows from the left table and includes matching right-side '
                          'data when available.\n'
                          '- RIGHT JOIN retains all rows from the right table where supported.\n'
                          '- FULL OUTER JOIN retains matched rows and unmatched rows from both sides where '
                          'supported.\n'
                          '- ON defines the relationship used to match records.\n'
                          '- A join may produce repeated-looking names when multiple related rows match.\n'
                          '\n'
                          'EXAMPLE\n'
                          'SELECT s.name, r.score\n'
                          'FROM students AS s\n'
                          'INNER JOIN results AS r\n'
                          'ON s.student_id = r.student_id;\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Differentiate INNER JOIN and LEFT JOIN.\n'
                          '2. Show student names with their scores from two related tables.\n'
                          '3. Why can joins produce repeated names?\n'
                          '4. Identify the key used to join students to results.\n'},
              {'title': 'Practice Queries',
               'difficulty': 3,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Combine filtering, sorting, grouping, aggregation, and joins.\n'
                          '- Build queries in logical stages.\n'
                          '- Check query results and assumptions.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Real queries combine SQL clauses to answer data questions. Identify the desired '
                          'output columns, choose source tables, filter rows, group if needed, and sort the '
                          'final result.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- WHERE filters rows.\n'
                          '- ORDER BY sorts results.\n'
                          '- GROUP BY aggregates rows into groups.\n'
                          '- HAVING filters aggregate groups.\n'
                          '- ON specifies join keys.\n'
                          "- SQL syntax can differ between systems; the supplied notes use Kaggle's BigQuery "
                          'learning context, so some syntax may differ from PostgreSQL or MySQL.\n'
                          '\n'
                          'EXAMPLE\n'
                          'SELECT subject, AVG(score) AS avg_score\n'
                          'FROM enrollments\n'
                          'GROUP BY subject\n'
                          'HAVING AVG(score) > 75\n'
                          'ORDER BY avg_score DESC;\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Count students by department.\n'
                          '2. List subjects by average score.\n'
                          '3. Find students without an enrollment using a suitable join.\n'
                          '4. Explain the role of SELECT, WHERE, GROUP BY, HAVING, and ORDER BY in a '
                          'query.\n'}],
  'assessment': {'title': 'SQL Fundamentals Assessment Quiz',
                 'description': 'In-app auto-graded MCQ section from the supplied SQL Fundamentals '
                                'Assessment Quiz. The source PDF contains 10 MCQs worth 4 marks each (40 '
                                'marks), 4 short-answer questions (20 marks), and 2 practical questions (40 '
                                'marks). The current Question model supports four-option auto-graded MCQs, '
                                'so this in-app quiz contains the 40-mark MCQ section only; the written and '
                                'practical sections remain in the source PDF.',
                 'duration_minutes': 60,
                 'total_marks': 40,
                 'questions': [('Which SQL clause specifies the table from which records are retrieved?',
                                'WHERE',
                                'FROM',
                                'ORDER BY',
                                'GROUP BY',
                                'B',
                                4,
                                1),
                               ('Which query returns every column from a table named Students?',
                                'SELECT Students;',
                                'SELECT ALL FROM Students;',
                                'SELECT * FROM Students;',
                                'GET * Students;',
                                'C',
                                4,
                                1),
                               ('Which clause filters individual rows before grouping?',
                                'HAVING',
                                'ORDER BY',
                                'WHERE',
                                'DISTINCT',
                                'C',
                                4,
                                1),
                               ('Which operator is commonly used to match a pattern such as names beginning '
                                "with 'A'?",
                                'IN',
                                'LIKE',
                                'BETWEEN',
                                'IS',
                                'B',
                                4,
                                1),
                               ('What does ORDER BY marks DESC do?',
                                'Sorts marks from lowest to highest',
                                'Removes duplicate marks',
                                'Sorts marks from highest to lowest',
                                'Groups equal marks',
                                'C',
                                4,
                                1),
                               ('Which function counts all rows when used as COUNT(*)?',
                                'SUM(*)',
                                'COUNT(*)',
                                'TOTAL(*)',
                                'NUMBER(*)',
                                'B',
                                4,
                                1),
                               ('Which clause filters grouped results after GROUP BY?',
                                'WHERE',
                                'HAVING',
                                'FROM',
                                'LIMIT',
                                'B',
                                4,
                                1),
                               ('Which join returns only rows with matching values in both tables?',
                                'INNER JOIN',
                                'LEFT JOIN',
                                'CROSS JOIN',
                                'FULL OUTER JOIN',
                                'A',
                                4,
                                1),
                               ('What does DISTINCT do in a SELECT query?',
                                'Sorts the output',
                                'Returns unique result rows',
                                'Deletes duplicate table rows',
                                'Combines two tables',
                                'B',
                                4,
                                1),
                               ('Which condition correctly checks whether a column has no SQL value?',
                                'column = NULL',
                                'column == NULL',
                                'column IS NULL',
                                'column EQUALS NULL',
                                'C',
                                4,
                                1)]}},
 {'title': 'Python for Data Science',
  'description': 'Python data-analysis course covering NumPy, Pandas, data cleaning, data visualization, and '
                 'exploratory data analysis (EDA). Includes worked examples, practice, and an auto-graded '
                 'MCQ quiz.',
  'lessons': [{'title': 'NumPy',
               'difficulty': 1,
               'content': 'PYTHON FOR DATA SCIENCE — LESSON 1: NUMPY\n'
                          '\n'
                          'LEARNING OBJECTIVES\n'
                          'Understand NumPy as a Python library for efficient numerical computing using '
                          'multidimensional arrays and mathematical operations.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'NumPy is a Python library for efficient numerical computing, especially through '
                          'multidimensional arrays and mathematical operations.\n'
                          '\n'
                          'IMPORTANT CONCEPTS\n'
                          "- ndarray is NumPy's main array structure.\n"
                          '- np.array() creates an array.\n'
                          '- Arrays support element-wise operations.\n'
                          '- mean(), sum(), min(), max(), and std() summarize values.\n'
                          '- Indexing begins at zero; shape describes dimensions.\n'
                          '\n'
                          'WORKED EXAMPLE\n'
                          'import numpy as np\n'
                          'marks = np.array([60, 70, 80])\n'
                          'print(marks + 5)  # [65 75 85]\n'
                          'print(marks.mean())  # 70.0\n'
                          '\n'
                          'EXPLANATION AND APPLICATIONS\n'
                          'NumPy is useful for numerical data, scientific calculations, and as a foundation '
                          'for data-analysis tools. Arrays can be one-dimensional or multidimensional.\n'
                          '\n'
                          'COMMON MISTAKES AND GOOD PRACTICE\n'
                          '- Check the input and expected output before running code.\n'
                          '- Use meaningful names and consistent formatting.\n'
                          '- Test examples with more than one input.\n'
                          '- Read error messages carefully and correct one issue at a time.\n'
                          '\n'
                          'QUICK REVISION\n'
                          "ndarray is NumPy's main array structure; np.array() creates an array; arrays "
                          'support element-wise operations; summary methods include mean(), sum(), min(), '
                          'max(), and std(); indexing starts at zero and shape describes dimensions.\n'
                          '\n'
                          'PRACTICE QUESTIONS\n'
                          '1. What is NumPy?\n'
                          '2. Create an array of three marks.\n'
                          '3. What is the result of np.array([2,4,6]) * 2?\n'
                          '4. Explain shape and indexing.\n'
                          '\n'
                          'SELF-CHECK\n'
                          'Run the example, change at least two values, observe the output, and explain why '
                          'it changes.'},
              {'title': 'Pandas',
               'difficulty': 1,
               'content': 'PYTHON FOR DATA SCIENCE — LESSON 2: PANDAS\n'
                          '\n'
                          'LEARNING OBJECTIVES\n'
                          'Use Pandas to load, inspect, clean, filter, and summarize tabular data.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Pandas is a Python library used to load, inspect, clean, filter, and summarize '
                          'tabular data.\n'
                          '\n'
                          'IMPORTANT CONCEPTS\n'
                          '- Series is one-dimensional labeled data.\n'
                          '- DataFrame stores rows and columns.\n'
                          '- read_csv() loads CSV data.\n'
                          '- head(), info(), and describe() inspect a dataset.\n'
                          '- Boolean conditions filter rows; groupby() summarizes categories.\n'
                          '\n'
                          'WORKED EXAMPLE\n'
                          'import pandas as pd\n'
                          "data = pd.read_csv('students.csv')\n"
                          'print(data.head())\n'
                          "print(data['score'].mean())\n"
                          '\n'
                          'EXPLANATION AND APPLICATIONS\n'
                          'Pandas supports data preparation and analysis. Check column names and types '
                          'before calculations, and use filters to select records relevant to a question.\n'
                          '\n'
                          'COMMON MISTAKES AND GOOD PRACTICE\n'
                          '- Check the input and expected output before running code.\n'
                          '- Use meaningful names and consistent formatting.\n'
                          '- Test examples with more than one input.\n'
                          '- Read error messages carefully and correct one issue at a time.\n'
                          '\n'
                          'QUICK REVISION\n'
                          'Series is one-dimensional labeled data; DataFrame stores rows and columns; '
                          'read_csv() loads CSV data; head(), info(), and describe() inspect data; boolean '
                          'conditions filter rows and groupby() summarizes categories.\n'
                          '\n'
                          'PRACTICE QUESTIONS\n'
                          '1. Differentiate Series and DataFrame.\n'
                          '2. Write code to load a CSV.\n'
                          '3. How do you filter scores above 80?\n'
                          '4. What does groupby() do?\n'
                          '\n'
                          'SELF-CHECK\n'
                          'Run the example, change at least two values, observe the output, and explain why '
                          'it changes.'},
              {'title': 'Data Cleaning',
               'difficulty': 2,
               'content': 'PYTHON FOR DATA SCIENCE — LESSON 3: DATA CLEANING\n'
                          '\n'
                          'LEARNING OBJECTIVES\n'
                          'Identify and handle missing, duplicated, inconsistent, or invalid values before '
                          'analysis.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Data cleaning identifies and handles missing, duplicated, inconsistent, or '
                          'invalid values before analysis.\n'
                          '\n'
                          'IMPORTANT CONCEPTS\n'
                          '- Investigate missing values before replacing them.\n'
                          '- drop_duplicates() removes duplicate rows.\n'
                          '- Data types should match column meaning.\n'
                          '- Text labels may need consistent formatting.\n'
                          '- Validate the dataset after cleaning.\n'
                          '\n'
                          'WORKED EXAMPLE\n'
                          'import pandas as pd\n'
                          "data = pd.read_csv('students.csv')\n"
                          'print(data.isnull().sum())\n'
                          'data = data.drop_duplicates()\n'
                          "data['score'] = pd.to_numeric(data['score'], errors='coerce')\n"
                          '\n'
                          'EXPLANATION AND APPLICATIONS\n'
                          'Cleaning improves reliability. Missing marks should not automatically become '
                          'zero; choose a treatment based on what the missing value represents and document '
                          'the decision.\n'
                          '\n'
                          'COMMON MISTAKES AND GOOD PRACTICE\n'
                          '- Check the input and expected output before running code.\n'
                          '- Use meaningful names and consistent formatting.\n'
                          '- Test examples with more than one input.\n'
                          '- Read error messages carefully and correct one issue at a time.\n'
                          '\n'
                          'QUICK REVISION\n'
                          'Investigate missing values before replacing them; drop_duplicates() removes '
                          'duplicate rows; types should match the column meaning; standardize text labels; '
                          'validate the dataset after cleaning.\n'
                          '\n'
                          'PRACTICE QUESTIONS\n'
                          '1. Define data cleaning.\n'
                          '2. List common data-quality problems.\n'
                          '3. Write code to count missing values.\n'
                          '4. Why should missing values not always be zero?\n'
                          '\n'
                          'SELF-CHECK\n'
                          'Run the example, change at least two values, observe the output, and explain why '
                          'it changes.'},
              {'title': 'Data Visualization',
               'difficulty': 2,
               'content': 'PYTHON FOR DATA SCIENCE — LESSON 4: DATA VISUALIZATION\n'
                          '\n'
                          'LEARNING OBJECTIVES\n'
                          'Communicate patterns using charts and graphs so comparisons, trends, and '
                          'distributions are easier to understand.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Data visualization communicates patterns using charts and graphs, making '
                          'comparisons, trends, and distributions easier to understand.\n'
                          '\n'
                          'IMPORTANT CONCEPTS\n'
                          '- Bar charts compare categories.\n'
                          '- Line charts show trends across ordered values or time.\n'
                          '- Histograms show numerical distributions.\n'
                          '- Scatter plots show relationships between numerical variables.\n'
                          '- Matplotlib creates charts; titles and labels improve clarity.\n'
                          '\n'
                          'WORKED EXAMPLE\n'
                          'import matplotlib.pyplot as plt\n'
                          "subjects = ['Python', 'SQL', 'Math']\n"
                          'scores = [80, 75, 88]\n'
                          'plt.bar(subjects, scores)\n'
                          "plt.xlabel('Subject')\n"
                          "plt.ylabel('Score')\n"
                          "plt.title('Scores by Subject')\n"
                          'plt.show()\n'
                          '\n'
                          'EXPLANATION AND APPLICATIONS\n'
                          'Choose a chart according to the question. Avoid misleading axes and explain the '
                          'main observation rather than presenting a chart without interpretation.\n'
                          '\n'
                          'COMMON MISTAKES AND GOOD PRACTICE\n'
                          '- Check the input and expected output before running code.\n'
                          '- Use meaningful names and consistent formatting.\n'
                          '- Test examples with more than one input.\n'
                          '- Read error messages carefully and correct one issue at a time.\n'
                          '\n'
                          'QUICK REVISION\n'
                          'Bar charts compare categories; line charts show trends; histograms show numerical '
                          'distributions; scatter plots show numerical relationships; Matplotlib creates '
                          'charts and titles/labels improve clarity.\n'
                          '\n'
                          'PRACTICE QUESTIONS\n'
                          '1. Differentiate a bar chart and histogram.\n'
                          '2. When is a line chart useful?\n'
                          '3. Write code for a simple bar chart.\n'
                          '4. List good visualization practices.\n'
                          '\n'
                          'SELF-CHECK\n'
                          'Run the example, change at least two values, observe the output, and explain why '
                          'it changes.'},
              {'title': 'Exploratory Data Analysis (EDA)',
               'difficulty': 2,
               'content': 'PYTHON FOR DATA SCIENCE — LESSON 5: EXPLORATORY DATA ANALYSIS (EDA)\n'
                          '\n'
                          'LEARNING OBJECTIVES\n'
                          'Examine a dataset using summary statistics and visualizations to understand '
                          'quality, distributions, unusual values, and relationships.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'EDA examines a dataset using summary statistics and visualizations to understand '
                          'quality, distributions, unusual values, and relationships.\n'
                          '\n'
                          'IMPORTANT CONCEPTS\n'
                          '- Mean is the arithmetic average; median is the middle value.\n'
                          '- Mode is the most frequent value; range is maximum minus minimum.\n'
                          '- Univariate analysis studies one variable; bivariate analysis studies two.\n'
                          '- Outliers need investigation rather than automatic removal.\n'
                          '- Correlation indicates association, not necessarily causation.\n'
                          '\n'
                          'WORKED EXAMPLE\n'
                          'Scores: 60, 70, 70, 80, 90\n'
                          'Mean = 370 / 5 = 74\n'
                          'Median = 70\n'
                          'Mode = 70\n'
                          'Range = 90 - 60 = 30\n'
                          '\n'
                          'EXPLANATION AND APPLICATIONS\n'
                          'EDA includes checking column types, missing values, descriptive statistics, '
                          'distributions, and relationships. Record limitations and avoid claiming causation '
                          'from correlation alone.\n'
                          '\n'
                          'COMMON MISTAKES AND GOOD PRACTICE\n'
                          '- Check the input and expected output before running code.\n'
                          '- Use meaningful names and consistent formatting.\n'
                          '- Test examples with more than one input.\n'
                          '- Read error messages carefully and correct one issue at a time.\n'
                          '\n'
                          'QUICK REVISION\n'
                          'Mean is the average; median is the middle value; mode is the most frequent value; '
                          'range is maximum minus minimum; univariate studies one variable and bivariate '
                          'studies two; investigate outliers; correlation is not necessarily causation.\n'
                          '\n'
                          'PRACTICE QUESTIONS\n'
                          '1. Define EDA.\n'
                          '2. Calculate mean, median, and range for 10, 20, 20, 30, 40.\n'
                          '3. Differentiate univariate and bivariate analysis.\n'
                          '4. What is an outlier?\n'
                          '\n'
                          'SELF-CHECK\n'
                          'Run the example, change at least two values, observe the output, and explain why '
                          'it changes.'}],
  'assessment': {'title': 'Python for Data Science Assessment Quiz',
                 'description': 'In-app auto-graded MCQ section from the supplied Python for Data Science '
                                'Assessment Quiz. The source PDF contains 10 MCQs worth 4 marks each (40 '
                                'marks), 4 short-answer questions (20 marks), and 2 practical questions (40 '
                                'marks). The current Question model supports four-option auto-graded MCQs, '
                                'so this in-app quiz contains the 40-mark MCQ section only; the written and '
                                'practical sections remain in the source PDF.',
                 'duration_minutes': 60,
                 'total_marks': 40,
                 'questions': [('Which NumPy structure is designed for efficient numerical arrays?',
                                'list only',
                                'ndarray',
                                'dictionary',
                                'tuple',
                                'B',
                                4,
                                1),
                               ('What is the usual purpose of pandas DataFrame?',
                                'Represent tabular data with labeled rows and columns',
                                'Compile Python code',
                                'Create neural-network layers only',
                                'Replace all Python data types',
                                'A',
                                4,
                                1),
                               ('In pandas, what does df.head() return by default?',
                                'Last five rows',
                                'First five rows',
                                'Only column names',
                                'Rows with missing values',
                                'B',
                                4,
                                1),
                               ('Which pandas method is commonly used to inspect missing values per column?',
                                'df.missing()',
                                'df.isna().sum()',
                                'df.nulls()',
                                'df.empty().sum()',
                                'B',
                                4,
                                1),
                               ('What is vectorization in NumPy?',
                                'Writing a loop in machine code manually',
                                'Applying operations to arrays without explicit Python loops for each '
                                'element',
                                'Converting every number to text',
                                'Sorting all arrays automatically',
                                'B',
                                4,
                                1),
                               ('Which method combines DataFrames using matching key columns?',
                                'pd.merge()',
                                'pd.plot()',
                                'pd.describe()',
                                'pd.fillna()',
                                'A',
                                4,
                                1),
                               ('What does df.describe() commonly provide for numeric columns?',
                                'A chart',
                                'Summary statistics such as mean and quartiles',
                                'A list of file names',
                                'A trained prediction model',
                                'B',
                                4,
                                1),
                               ('Which chart is usually suitable for showing the distribution of one '
                                'numerical variable?',
                                'Histogram',
                                'Pie chart of every raw value',
                                'Network diagram',
                                'Gantt chart',
                                'A',
                                4,
                                1),
                               ('Why should duplicate records be checked during data cleaning?',
                                'They always improve accuracy',
                                'They can unintentionally bias counts and summaries',
                                'They convert strings to integers',
                                'They guarantee a balanced dataset',
                                'B',
                                4,
                                1),
                               ('What is the main purpose of exploratory data analysis (EDA)?',
                                'Deploy an application',
                                'Understand structure, patterns, distributions and possible data-quality '
                                'issues',
                                'Guarantee causation',
                                'Replace data collection',
                                'B',
                                4,
                                1)]}},
 {'title': 'Introduction to Machine Learning',
  'description': 'Introductory machine-learning course covering learning types, regression, classification, '
                 'model evaluation, and overfitting/underfitting.',
  'lessons': [{'title': 'Introduction and Types of Machine Learning',
               'difficulty': 1,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Explain machine learning in simple terms.\n'
                          '- Distinguish features from target labels.\n'
                          '- Recognize supervised, unsupervised, regression, classification, and clustering '
                          'tasks.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Machine learning uses patterns learned from data to make predictions or discover '
                          'structure.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- Features are input variables used by a model.\n'
                          '- The target or label is the value the model is asked to predict in a supervised '
                          'task.\n'
                          '- Supervised learning uses labelled examples.\n'
                          '- Unsupervised learning explores data without target labels.\n'
                          '- Regression predicts numerical values.\n'
                          '- Classification predicts categories.\n'
                          '- Clustering groups similar observations.\n'
                          '\n'
                          'EXAMPLE\n'
                          "Estimating a student's numerical score is a regression task. Predicting pass/fail "
                          'is a classification task. Grouping similar customers without predefined labels is '
                          'clustering.\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Define machine learning.\n'
                          '2. Differentiate supervised and unsupervised learning.\n'
                          '3. What are features and labels?\n'
                          '4. Decide whether predicting a house price is regression or classification.\n'},
              {'title': 'Regression',
               'difficulty': 2,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Explain regression as a supervised-learning task.\n'
                          '- Interpret the simple linear regression equation.\n'
                          '- Identify common regression metrics.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Regression predicts a numerical target, such as a score or price.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- Simple linear regression models a relationship with a line.\n'
                          '- Equation: y = a + bx.\n'
                          '- y is the predicted value, a is the intercept, b is the slope, and x is an input '
                          'feature.\n'
                          '- A residual is the observed value minus the predicted value.\n'
                          '- Common measures include MAE, MSE, RMSE, and R-squared (R²).\n'
                          '- Keep test data separate from model fitting when evaluating performance.\n'
                          '\n'
                          'EXAMPLE\n'
                          'y = a + bx\n'
                          'If the input x changes, the model estimates a numerical y value using the '
                          'intercept and slope.\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Define regression.\n'
                          '2. Explain y = a + bx.\n'
                          '3. Name two regression metrics.\n'
                          '4. Explain why test data should not be used to fit the model before final '
                          'evaluation.\n'},
              {'title': 'Classification',
               'difficulty': 2,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Explain classification and its types.\n'
                          '- Interpret a confusion matrix.\n'
                          '- Recognize accuracy, precision, recall, and F1 score.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Classification predicts a category, such as pass/fail or low/medium/high.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- Binary classification has two classes; multiclass classification has more than '
                          'two.\n'
                          '- A confusion matrix summarizes correct and incorrect predictions.\n'
                          '- TP = true positive; TN = true negative; FP = false positive; FN = false '
                          'negative.\n'
                          '- Accuracy = (TP + TN) / total.\n'
                          '- Precision = TP / (TP + FP).\n'
                          '- Recall = TP / (TP + FN).\n'
                          '- F1 balances precision and recall.\n'
                          '\n'
                          'EXAMPLE\n'
                          'A model that predicts whether an email is spam or not spam performs binary '
                          'classification.\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Differentiate binary and multiclass classification.\n'
                          '2. Define TP, FP, TN, and FN.\n'
                          '3. Write the precision and recall formulas.\n'
                          '4. Explain why accuracy alone may be insufficient for an imbalanced dataset.\n'},
              {'title': 'Model Evaluation',
               'difficulty': 2,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Explain why unseen-data evaluation matters.\n'
                          '- Distinguish training, validation, and test sets.\n'
                          '- Choose suitable evaluation metrics.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Evaluation estimates how well a model performs on data that was not used to fit '
                          'it.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- Training data fits model parameters.\n'
                          '- Validation data helps compare models and tune settings.\n'
                          '- Test data supports a final held-out evaluation.\n'
                          '- Regression commonly uses MAE, MSE, RMSE, and R².\n'
                          '- Classification commonly uses accuracy, precision, recall, and F1.\n'
                          '- Data leakage lets information from outside the training process improperly '
                          'influence the model, making evaluation unreliable.\n'
                          '\n'
                          'EXAMPLE WORKFLOW\n'
                          'Choose a metric -> split data -> train -> validate/tune -> test -> report results '
                          'and limitations.\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Why do we evaluate a model?\n'
                          '2. Differentiate training, validation, and test sets.\n'
                          '3. What is data leakage?\n'
                          '4. Suggest a metric for a numerical prediction task and one for a classification '
                          'task.\n'},
              {'title': 'Overfitting and Underfitting',
               'difficulty': 3,
               'content': 'LEARNING OBJECTIVES\n'
                          '- Recognize overfitting and underfitting from training and test performance.\n'
                          '- Explain generalization.\n'
                          '- Identify ways to reduce overfitting.\n'
                          '\n'
                          'CORE CONCEPT\n'
                          'Overfitting occurs when a model learns details specific to the training data and '
                          'performs poorly on new data. Underfitting occurs when a model fails to learn '
                          'important patterns.\n'
                          '\n'
                          'IMPORTANT POINTS\n'
                          '- Overfitting: strong training performance but weaker test performance.\n'
                          '- Underfitting: poor performance on both training and test data.\n'
                          '- Model complexity affects generalization.\n'
                          '- Regularization can discourage excessive complexity.\n'
                          '- Evaluation on held-out data helps reveal these problems.\n'
                          '\n'
                          'EXAMPLE\n'
                          'A model that memorizes past student records but predicts poorly for new students '
                          'is overfitting.\n'
                          '\n'
                          'PRACTICE\n'
                          '1. Define overfitting and underfitting.\n'
                          '2. Compare training and test performance in each case.\n'
                          '3. List ways to reduce overfitting.\n'
                          '4. Explain why held-out evaluation is important.\n'}],
  'assessment': {'title': 'Introduction to Machine Learning Assessment Quiz',
                 'description': 'In-app auto-graded MCQ section from the supplied Introduction to Machine '
                                'Learning Assessment Quiz. The source PDF contains 10 MCQs worth 4 marks '
                                'each (40 marks), 4 short-answer questions (20 marks), and 2 practical '
                                'questions (40 marks). The current Question model supports four-option '
                                'auto-graded MCQs, so this in-app quiz contains the 40-mark MCQ section '
                                'only; the written and practical sections remain in the source PDF.',
                 'duration_minutes': 60,
                 'total_marks': 40,
                 'questions': [('In supervised learning, training examples include:',
                                'Only inputs without any target values',
                                'Inputs paired with known target labels or values',
                                'No data',
                                'Only rewards from an environment',
                                'B',
                                4,
                                1),
                               ('Which task is a regression problem?',
                                "Predicting a house's sale price",
                                'Classifying an email as spam or not spam',
                                'Grouping customers without labels',
                                'Finding frequent words',
                                'A',
                                4,
                                1),
                               ('Which task is a classification problem?',
                                "Predicting tomorrow's temperature as a number",
                                'Estimating delivery time in minutes',
                                'Predicting whether a transaction is fraudulent',
                                'Calculating average marks',
                                'C',
                                4,
                                1),
                               ('Why is a dataset commonly split into training and test sets?',
                                'To make all rows identical',
                                'To estimate performance on data not used for fitting',
                                'To remove the target column permanently',
                                'To guarantee 100% accuracy',
                                'B',
                                4,
                                1),
                               ('What does overfitting mean?',
                                'The model is too simple to learn the pattern',
                                'The model fits training data well but performs poorly on unseen data',
                                'The data contains no features',
                                'The model has no parameters',
                                'B',
                                4,
                                1),
                               ('Which metric is the fraction of correct predictions among all predictions?',
                                'Accuracy',
                                'Mean squared error',
                                'R-squared only',
                                'Training time',
                                'A',
                                4,
                                1),
                               ('For a regression model, what does mean absolute error (MAE) measure?',
                                'Average absolute difference between actual and predicted values',
                                'Fraction of positive labels',
                                'Number of model parameters',
                                'Percentage of missing values',
                                'A',
                                4,
                                1),
                               ('Which method is commonly used to evaluate model performance across multiple '
                                'data splits?',
                                'Cross-validation',
                                'Renaming columns',
                                'One-hot encoding alone',
                                'Sorting the target',
                                'A',
                                4,
                                1),
                               ('What is a feature in a machine-learning dataset?',
                                'The target the model must predict only',
                                'An input variable used by the model',
                                'The final accuracy score',
                                'A type of chart',
                                'B',
                                4,
                                1),
                               ('Why can class imbalance make accuracy misleading?',
                                'Accuracy is never calculated for classification',
                                'A model may predict the majority class and still score highly',
                                'It automatically removes minority examples',
                                'It guarantees perfect recall',
                                'B',
                                4,
                                1)]}}]


class Command(BaseCommand):
    help = "Import SQL Fundamentals, Python for Data Science, and Introduction to Machine Learning."

    @transaction.atomic
    def handle(self, *args, **options):
        courses_processed = 0
        lessons_processed = 0
        assessments_processed = 0
        questions_processed = 0

        for course_data in COURSES:
            course, _ = Course.objects.update_or_create(
                title=course_data["title"],
                defaults={"description": course_data["description"]},
            )
            courses_processed += 1
            self.stdout.write(f"Course ready: {course.title} (id={course.id})")

            for lesson_order, lesson_data in enumerate(course_data["lessons"], start=1):
                lesson, _ = Lesson.objects.update_or_create(
                    course=course,
                    title=lesson_data["title"],
                    defaults={
                        "content": lesson_data["content"],
                        "difficulty": lesson_data["difficulty"],
                        "order": lesson_order,
                    },
                )
                lessons_processed += 1
                self.stdout.write(f"  Lesson ready ({lesson_order}): {lesson.title}")

            assessment_data = course_data["assessment"]
            assessment, _ = Assessment.objects.update_or_create(
                course=course,
                title=assessment_data["title"],
                defaults={
                    "description": assessment_data["description"],
                    "total_marks": assessment_data["total_marks"],
                    "duration_minutes": assessment_data["duration_minutes"],
                },
            )
            assessments_processed += 1

            for question_data in assessment_data["questions"]:
                (question_text, option_a, option_b, option_c, option_d,
                 correct_option, marks, difficulty) = question_data
                Question.objects.update_or_create(
                    assessment=assessment,
                    question_text=question_text,
                    defaults={
                        "option_a": option_a,
                        "option_b": option_b,
                        "option_c": option_c,
                        "option_d": option_d,
                        "correct_option": correct_option,
                        "marks": marks,
                        "difficulty": difficulty,
                    },
                )
                questions_processed += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"  Assessment ready: {assessment.title} "
                    f"(id={assessment.id}; {len(assessment_data['questions'])} MCQs; "
                    f"{assessment.total_marks} marks; {assessment.duration_minutes} minutes)"
                )
            )

        self.stdout.write(self.style.SUCCESS(
            "Import finished successfully. "
            f"Courses processed: {courses_processed}; lessons processed: {lessons_processed}; "
            f"assessments processed: {assessments_processed}; MCQ questions processed: {questions_processed}. "
            "Existing Data Science Fundamentals and Python Basics records, student progress, and assessment attempts were not deleted or reset."
        ))
