#!/bin/bash
# Check if services are running
pm2 list | grep fastapi
pm2 list | grep django
pm2 list | grep nextjs

# Check endpoints
curl -f http://localhost:8000/health/ || exit 1
curl -f http://localhost:8001/health/ || exit 1
curl -f http://localhost:3000/ || exit 1 