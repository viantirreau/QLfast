#!/bin/sh
set -e

# Exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
