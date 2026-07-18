#!/usr/bin/env sh
set -eu

IMAGE="openapitools/openapi-generator-cli:v7.15.0@sha256:509f01c3c7eee9d1ad286506a7b6aa4624a95b410be9a238a306d209e900621f"
MODE="${1:-temp}"

case "$MODE" in
  sync)
    TS_OUTPUT=/local/packages/api-client-ts/generated
    DART_OUTPUT=/local/packages/api-client-dart/lib/generated/client
    DART_PUBSPEC=packages/api-client-dart/lib/generated/client/pubspec.yaml
    ;;
  temp)
    TS_OUTPUT=/local/.generated/typescript
    DART_OUTPUT=/local/.generated/dart
    DART_PUBSPEC=.generated/dart/pubspec.yaml
    ;;
  *)
    echo "Usage: $0 [sync|temp]" >&2
    exit 2
    ;;
esac

COMMON="--additional-properties=hideGenerationTimestamp=true"
docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/local" "$IMAGE" generate \
  -i /local/docs/technical/openapi-v1.yaml -g typescript-fetch \
  -o "$TS_OUTPUT" $COMMON --global-property=apis,models,supportingFiles
docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/local" "$IMAGE" generate \
  -i /local/docs/technical/openapi-v1.yaml -g dart-dio \
  -o "$DART_OUTPUT" $COMMON --global-property=apis,models,supportingFiles

# The generated package is consumed from a Dart 3.10 workspace. Keeping the
# nested package on the generator's Dart 2.18 default makes current build_runner
# outputs use a different language version from their source libraries.
sed -i.bak "s/sdk: '>=2.18.0 <4.0.0'/sdk: '>=3.10.4 <4.0.0'/" "$DART_PUBSPEC"
rm -f "$DART_PUBSPEC.bak"

echo "Generated deterministic TypeScript and Dart clients ($MODE)."
