MAJOR_VERSION=1.0.0
GENERATED_TIME=$(date +'%s')
COMMIT_SHA=$(git log --oneline | head -1 | awk '{print substr ($0, 0, 7)}')
COMMIT_MESSAGE=$(git log --oneline | head -1 | awk '{print substr ($0, 9)}')
RELEASE_CHANNEL=$(git rev-parse --abbrev-ref HEAD)
DEVICE=$(hostname)
DEV_NAME=$(git log -1 --pretty=format:"%an")
DEV_EMAIL=$(git log -1 --pretty=format:'%ae')

rm -rf build_info.json
echo "{\"version\":\"$MAJOR_VERSION\",\"sha\":\"$COMMIT_SHA\",\"message\":\"$COMMIT_MESSAGE\",\"channel\":\"$RELEASE_CHANNEL\",\"device\":\"$DEVICE\",\"dev\":\"$DEV_NAME <$DEV_EMAIL>\",\"dev_name\":\"$DEV_NAME\",\"dev_email\":\"$DEV_EMAIL\",\"time\":\"$GENERATED_TIME\"}" | tee build_info.json > /dev/null
echo "build_info.json saved for deployment $COMMIT_SHA ($RELEASE_CHANNEL) by $DEV_NAME <$DEV_EMAIL>"