FROM python:3.11-slim AS builder

# Update and install packages.
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory.
WORKDIR /app

# Create venv.
RUN pip install uv==0.6.13
RUN uv venv venv

# Add  wait-for-it.sh.
RUN curl -o /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh

# Install the app.
COPY backend/dist/*.whl .
RUN uv pip install *.whl --no-cache-dir --python /app/venv/bin/python


FROM python:3.11-slim AS final

# Add a user to run the code.
RUN groupadd --system app && useradd --system --gid app app

# Set environment variables.
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory.
WORKDIR /app
COPY --from=builder /app/venv ./venv

# Copy alembic configuration and migration scripts from the build context.
COPY backend/alembic.ini .
COPY backend/migrations ./migrations

# Copy start.sh.
COPY qa/docker/app/start.sh /usr/local/bin/

# Copy the startup scripts into a directory on the PATH and make them executable.
# NOTE: Added wait-for-it.sh as it's used by start.sh.
COPY --from=builder /usr/local/bin/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/start.sh /usr/local/bin/wait-for-it.sh

# Set the user.
RUN chown -R app:app /app
USER app

ENTRYPOINT [ "start.sh" ]
