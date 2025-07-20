# Week Eat Planner
A menu planner for a week. Get a shopping list in one click.

## Features
- Plan meals for the entire week
- User authentication and management
- Integration with PostgreSQL for data storage
- RESTful API with FastAPI
- Frontend with Vue.js

## Prerequisites
- Python 3.11
Everyting else runs in docker.

## Installation

### Backend
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/week-eat-planner.git
    cd week-eat-planner/
    ```

2. Create a virtual environment:
    ```bash
    make install
    ```

5. Run the app server:
    ```bash
    make start
    ```

### Frontend
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2. Install the dependencies:
    ```bash
    yarn install
    ```

3. Run the development server:
    ```bash
    yarn serve
    ```

## Running Tests
To run the backend tests:
```bash
make be_tests
```

To run the frontend tests:
```bash
make fe_tests
```


## Autotests

The project comes with autotests. All in qa/ folder.

To prepare your local machine for autotests:
```bash
make -C qa install
```

To run the app in detached mode:
```bash
make -C qa start
```

To read logs:
```bash
make -C qa logs
```

To run autotests:
```bash
make -C qa test
```

To run QA linters:
```bash
make -C qa lint
```

## Project Structure
```
week-eat-planner/
├── backend/
│   ├── alembic/                # Database migrations
│   ├── app/                    # FastAPI application
│   ├── tests/                  # Unit tests
│   ├── main.py                 # Entry point for the FastAPI app
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── public/                 # Public assets
│   ├── src/                    # Vue.js source code
│   ├── tests/                  # Frontend tests
│   └── package.json            # Node.js dependencies
├── qa/                         # Base QA folder
│   ├── docker/                 # Docker compose files
│   ├── tests/                  # Tests 
│   └── wep_qa                  # Autotests infrastructure
└── README.md                   # Project documentation
```

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## License
TBD
