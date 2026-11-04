echo "##############################################################"
echo "#         Starting frontend and backend servers              #"
echo "##############################################################"

cd frontend

ng serve &

cd ../backend

echo "Backend: http://localhost:8000"
