# Week Eat Planner

A menu planner for a week. Get a shopping list in one click.

## Features

- Plan meals for the entire week
- User authentication and management
- Integration with PostgreSQL for data storage
- RESTful API with FastAPI
- Frontend with Nuxt and Vue.js

## Prerequisites

- Python 3.14
- [uv](https://github.com/astral-sh/uv)
- Docker
- Node.js 24 and Bun 1.3.14
- GNU Make 3.82 or newer

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/week-eat-planner.git
    cd week-eat-planner/
    ```

2.  **Install dependencies:**
    ```bash
    make install
    make fe_install
    ```

## Usage

The `Makefile` contains all the necessary commands to run and manage the application.

- **`make install`**: Installs backend dependencies.
- **`make fe_install`**: Installs frontend dependencies and prepares Nuxt.
- **`make start`**: Starts the backend and its services.
- **`make fe_start`**: Starts the Nuxt frontend on port 3000.
- **`make stop`**: Stops the application and its services.
- **`make lint`**: Runs the linters to check the code for style and errors.
- **`make fe_lint`**: Checks frontend code, styles, formatting, and TypeScript types without fixing files.
- **`make fe_style`**: Formats frontend files and applies automatic lint fixes.
- **`make be_test`**: Runs the backend unit tests.
- **`make fe_test`**: Runs frontend unit tests with enforced coverage thresholds.

For a full list of commands, run `make help`.

## Running Tests

- **Backend:**

  ```bash
  make be_test
  ```

- **Frontend:**
  ```bash
  make fe_test
  ```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
