#!/bin/bash

source .venv/bin/activate

uvicorn backend.app.main:app --reload