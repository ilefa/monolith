token=$( cat token.txt )
docker run --rm -it --net=host --name=monolith -d -e TOKEN=$token -e MANAGED=true -v /etc/timezone:/etc/timezone:ro -v /etc/localtime:/etc/localtime:ro monolith
