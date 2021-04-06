docker build -t evgenijavstein/multi-client:latest -t evgenijavstein/multi-client:$SHA -f ./client/Dockerfile ./client 
docker build -t evgenijavstein/multi-server:latest -t evgenijavstein/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t evgenijavstein/multi-worker:latest -t evgenijavstein/multi-worker:$SHA -f ./worker/Dockerfile ./worker 
docker push evgenijavstein/multi-client:latest
docker push evgenijavstein/multi-server:latest
docker push evgenijavstein/multi-worker:latest
docker push evgenijavstein/multi-client:$SHA
docker push evgenijavstein/multi-server:$SHA
docker push evgenijavstein/multi-worker:$SHA
kubectl apply -f k8s
kubectl set image deployments/server-deployment server=evgenijavstein/multi-server:$SHA 
kubectl set image deployments/client-deployment client=evgenijavstein/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=evgenijavstein/multi-worker:$SHA  