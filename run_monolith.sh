token=$( cat token.txt )
docker run --rm -it --net=host --name=monolith -d -e TOKEN=$token -e MANAGED=true monolith
