#!/bin/sh
echo "starting nodes"
forever start index.js PORT 3001 RPORT 3002 &
forever start index.js PORT 3003 RPORT 3004

