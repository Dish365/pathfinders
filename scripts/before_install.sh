#!/bin/bash
# Stop existing processes
pm2 stop all || true
# Clean installation directory
rm -rf /var/www/pathfinders/* 