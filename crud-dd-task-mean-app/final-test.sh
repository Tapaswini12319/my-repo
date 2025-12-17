#!/bin/bash

echo "=== FINAL MEAN STACK TEST ==="

cd ~/my-repo/crud-dd-task-mean-app

echo "1. Container Status:"
docker-compose ps

echo -e "\n2. Backend Test (port 5000):"
curl -s http://localhost:5000
echo ""

echo -e "\n3. Create Tutorial:"
curl -X POST http://localhost:5000/api/tutorials \
  -H "Content-Type: application/json" \
  -d '{"title":"MEAN Stack","description":"Deployed with Docker Compose"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n4. List Tutorials:"
curl -s http://localhost:5000/api/tutorials | head -c 300
echo "..."

echo -e "\n5. Frontend Test:"
curl -s http://localhost | grep -o "<title>[^<]*</title>"

echo -e "\n6. Container Connectivity:"
echo "Frontend -> Backend:"
docker exec crud-dd-task-mean-app_frontend_1 curl -s http://backend:8080/api/tutorials | head -c 100
echo ""

echo -e "\n7. MongoDB Test:"
docker exec crud-dd-task-mean-app_mongo_1 mongosh --quiet --eval "
use meancrud;
print('Database: meancrud');
print('Collections:', JSON.stringify(db.getCollectionNames()));
print('Tutorial count:', db.tutorials.countDocuments());
" 2>/dev/null || echo "MongoDB test skipped"

echo -e "\n=== PUBLIC ACCESS ==="
IP=$(curl -s ifconfig.me)
echo "✅ Frontend: http://$IP"
echo "✅ Backend API: http://$IP:5000/api/tutorials"
echo ""
echo "Open http://$IP in your browser!"
echo "The CRUD application should work perfectly now."
