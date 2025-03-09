#!/bin/bash
cd discordbot
git pull origin main
npm install # Install any new dependencies
pm2 restart bkextra # Restart the bot (if using PM2)
pm2 log bkextra
