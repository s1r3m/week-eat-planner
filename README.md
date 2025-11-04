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
- [uv](https://github.com/astral-sh/uv)
- Docker

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/week-eat-planner.git
    cd week-eat-planner/
    ```

2.  **Install dependencies:**
    ```bash
    make install
    ```

## Usage

The `Makefile` contains all the necessary commands to run and manage the application.

-   **`make install`**: Installs all the required dependencies.
-   **`make start`**: Starts the application and its services.
-   **`make stop`**: Stops the application and its services.
-   **`make lint`**: Runs the linters to check the code for style and errors.
-   **`make style`**: Formats the code according to the project's style guidelines.
-   **`make be_test`**: Runs the backend unit tests.
-   **`make fe_test`**: Runs the frontend unit tests (not yet implemented).

For a full list of commands, run `make help`.

## Running Tests
<<<<<<< Updated upstream
To run the backend tests:
```bash
make migrations
make be_tests
```
=======
>>>>>>> Stashed changes

-   **Backend:**
    ```bash
    make be_test
    ```

-   **Frontend:**
    ```bash
    make fe_test
    ```

## Project Structure

```
week-eat-planner/
<<<<<<< Updated upstream
├── backend/
│   ├── alembic/                # Database migrations
│   ├── week_eat_planner/       # FastAPI application
│   ├── tests/                  # Unit tests
│   ├── main.py                 # Entry point for the FastAPI app
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
=======
├── .github/                  # GitHub Actions workflows
├── .idea/                    # IDE configuration
├── backend/                  # FastAPI application
│   ├── alembic/              # Database migrations
│   ├── tests/                # Unit tests
│   └── week_eat_planner/     # Application source code
├── frontend/                 # Vue.js application
│   ├── public/               # Public assets
│   ├── src/                  # Vue.js source code
│   └── tests/                # Frontend tests
├── qa/                       # QA and testing
│   ├── docker/               # Docker-compose files for tests
│   ├── tests/                # Autotests
│   └── wep_qa/               # Autotests infrastructure
├── .gitignore
├── docker-compose.yml
├── Makefile
└── README.md
>>>>>>> Stashed changes
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
