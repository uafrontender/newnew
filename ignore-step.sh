#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "development" || "$VERCEL_GIT_COMMIT_REF" == "staging" || "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == "dmitry/attempt-to-enhance-language-change" || "$VERCEL_GIT_COMMIT_REF" == "vlad/try-no-animation-cropper" ||  "$VERCEL_GIT_COMMIT_REF" == "valeria/search-redesign" || "$VERCEL_GIT_COMMIT_REF" == "dmitry/revamp-responses-slider-to-custom" || "$VERCEL_GIT_COMMIT_REF" == "valeria/chat" ]]; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
