#!/bin/sh
echo "starting nodes"
node index.js PORT 3001 RPORT 3002 &
node index.js PORT 3003 RPORT 3004

