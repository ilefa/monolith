result=$( docker images -q monolith )
token=$( cat token.txt )

if [[ -n "$result" ]]; then
  docker kill monolith
  sleep 1.5
  docker rmi --force monolith
fi

docker build -t monolith --build-arg TOKEN=$token .
docker run --rm -it --net=host --name=monolith -d -e TOKEN=$token -e MANAGED=true -v /etc/timezone:/etc/timezone:ro -v /etc/localtime:/etc/localtime:ro monolith
