result=$( docker images -q monolith )
token=$( cat token.txt )

if [[ -n "$result" ]]; then
  docker container stop -t 5 monolith
  sleep 1.5
  docker rmi monolith
fi

git pull
docker build -t monolith --build-arg TOKEN=$token .
docker run --rm -it --net=host --name=monolith -d -e TOKEN=$token -e MANAGED=true monolith
