# Check make version.
MAKE_MIN_VERSION := 3.82
MAKE_OK := $(filter $(MAKE_MIN_VERSION),$(firstword $(sort $(MAKE_VERSION) $(MAKE_MIN_VERSION))))
ifeq ($(MAKE_OK),)
	$(error Make version required $(MAKE_MIN_VERSION)+, current version: $(MAKE_VERSION))
endif

# Versions.
PYTHON_VERSION = 3.11
PYTHON = python$(PYTHON_VERSION)
UV_VERSION = 0.6.11

# Paths.
PROJECT_PATH = $(shell dirname $(CURDIR))

export VIRTUAL_ENV = $(PROJECT_PATH)/.venv_at_$(PYTHON)

# Bin.
VENV_ACTIVATE = $(VIRTUAL_ENV)/bin/activate

# Other.
SHELL = /bin/bash  # Using bash as default shell
CHECK_PYTHON = $(shell which $(PYTHON))
CHECK_UV = $(shell which uv)

export PATH := $(VIRTUAL_ENV)/bin:$(HOME)/.local/bin:$(PATH)
export PYTHONPATH = $(BE_PATH)

all: help

## ------------------------------------------------ SETUP --------------------------------------------------------------

$(VENV_ACTIVATE):
	# Check if uv is installed.
ifeq ($(CHECK_UV), )
	# UV is not installed, installing it...
	curl -LsSf https://astral.sh/uv/$(UV_VERSION)/install.sh | sh
endif
	# Check if correct python is installed.
ifeq ($(CHECK_PYTHON), )
	# $(PYTHON) was not found but needed to continue. Installing it...
	uv python install $(PYTHON_VERSION)
endif
	uv venv $(VIRTUAL_ENV) --python $(PYTHON_VERSION)

## @Setup Prepare environment.
install: $(VENV_ACTIVATE)
	# Check user uid
ifeq ($(UID),0)
	$(error Can not run this command as root user)
endif

	uv sync --active --python $(VIRTUAL_ENV)/bin/python

## ------------------------------------------------ APP ----------------------------------------------------------------

## @App Start the environment.
start: stop
	$(MAKE) -C .. package
	cd $(PROJECT_PATH)/qa/docker 	 && \
		docker compose build --pull  && \
		docker compose up --detach --wait nginx
ifneq ($(GITHUB_ACTIONS),true)
	$(MAKE) logs
endif

logs:
	cd $(PROJECT_PATH)/qa/docker 	 && \
		docker compose logs --follow

## @App Stop the environment.
stop:
	cd $(PROJECT_PATH)/qa/docker  && \
		docker compose kill  	  && \
		docker compose down --volumes --remove-orphans

## @App SSH to backend container.
in:
	docker exec -it docker-backend-1 bash

## ------------------------------------------------ TESTS --------------------------------------------------------------

## @Checks Run linters.
lint: $(VENV_ACTIVATE)
	ruff check $(PROJECT_PATH)/qa --diff
	ruff format $(PROJECT_PATH)/qa --diff
	mypy --config-file $(PROJECT_PATH)/qa/pyproject.toml $(PROJECT_PATH)/qa

## @Checks Run code formatter.
style: $(VENV_ACTIVATE)
	ruff check --fix $(PROJECT_PATH)/qa
	ruff format $(PROJECT_PATH)/qa

test: $(VENV_ACTIVATE)
	pytest tests


HELP_TARGET_MAX_CHAR_NUM = 20

.PHONY:
help:
	@echo Usage:
	@echo '  make <target>'
	@echo '  make <target> <VAR>=<value>'
	@echo ''
	@awk '/^[a-zA-Z\-\_0-9\/]+:/ \
		{ \
			helpMessage = match(lastLine, /^## (.*)/); \
			if (helpMessage) { \
				helpCommand = substr($$1, 0, index($$1, ":")-1); \
				helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
				helpGroup = match(helpMessage, /^@([^ ]*)/); \
				if (helpGroup) { \
					helpGroup = substr(helpMessage, RSTART + 1, index(helpMessage, " ")-2); \
					helpMessage = substr(helpMessage, index(helpMessage, " ")+1); \
				} \
				printf "%s|  %-$(HELP_TARGET_MAX_CHAR_NUM)s %s\n", \
					helpGroup, helpCommand, helpMessage; \
			} \
		} \
		{ lastLine = $$0 }' \
		$(MAKEFILE_LIST) \
	| sort -t'|' -sk1,1 -k2,2 \
	| awk -F '|' ' \
			{ \
			cat = $$1; \
			if (cat != lastCat || lastCat == "") { \
				if ( cat == "0" ) { \
					print "Targets: " \
				} else { \
					gsub("_", " ", cat); \
					printf "\%s:\n", cat; \
				} \
			} \
			print $$2 \
		} \
		{ lastCat = $$1 }'
