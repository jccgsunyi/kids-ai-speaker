#!/bin/bash
cd "$(dirname "$0")/.."
docker-compose up -d
echo "Started! Logs: docker logs -f kids-ai-speaker"