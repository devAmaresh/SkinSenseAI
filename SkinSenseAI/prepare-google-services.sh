#!/bin/bash

echo "Preparing google-services.json file..."

# Decode and write the file
echo $GOOGLE_SERVICES_BASE64 | base64 -d > android/app/google-services.json
echo $IOS_SERVICES_BASE64 | base64 -d > ios/Runner/GoogleService-Info.plist
