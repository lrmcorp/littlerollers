#!/usr/bin/env sh
set -eu

IMAGE="openapitools/openapi-generator-cli:v7.15.0@sha256:509f01c3c7eee9d1ad286506a7b6aa4624a95b410be9a238a306d209e900621f"
LOCAL_JAR=".cache/openapi-generator/openapi-generator-cli-7.15.0.jar"
MODE="${1:-temp}"

case "$MODE" in
  sync)
    TS_OUTPUT=/local/.generated/sync/typescript
    DART_OUTPUT=/local/.generated/sync/dart
    DART_PUBSPEC=.generated/sync/dart/pubspec.yaml
    LOCAL_TS_OUTPUT=.generated/sync/typescript
    LOCAL_DART_OUTPUT=.generated/sync/dart
    TARGET_TS_OUTPUT=packages/api-client-ts/generated
    TARGET_DART_OUTPUT=packages/api-client-dart/lib/generated/client
    rm -rf .generated/sync
    ;;
  temp)
    TS_OUTPUT=/local/.generated/typescript
    DART_OUTPUT=/local/.generated/dart
    DART_PUBSPEC=.generated/dart/pubspec.yaml
    LOCAL_TS_OUTPUT=.generated/typescript
    LOCAL_DART_OUTPUT=.generated/dart
    ;;
  *)
    echo "Usage: $0 [sync|temp]" >&2
    exit 2
    ;;
esac

COMMON="--additional-properties=hideGenerationTimestamp=true"
if [ -z "${OPENAPI_GENERATOR_JAR:-}" ] && [ -f "$LOCAL_JAR" ]; then
  OPENAPI_GENERATOR_JAR="$LOCAL_JAR"
fi

if [ -n "${OPENAPI_GENERATOR_JAR:-}" ]; then
  if [ -n "${OPENAPI_GENERATOR_JAVA:-}" ]; then
    JAVA_COMMAND="$OPENAPI_GENERATOR_JAVA"
  elif [ -x "/opt/homebrew/opt/openjdk@21/bin/java" ]; then
    JAVA_COMMAND="/opt/homebrew/opt/openjdk@21/bin/java"
  else
    JAVA_COMMAND="java"
  fi
  "$JAVA_COMMAND" -jar "$OPENAPI_GENERATOR_JAR" generate \
    -i docs/technical/openapi-v1.yaml -g typescript-fetch \
    -o "$LOCAL_TS_OUTPUT" $COMMON --global-property=apis,models,supportingFiles
  "$JAVA_COMMAND" -jar "$OPENAPI_GENERATOR_JAR" generate \
    -i docs/technical/openapi-v1.yaml -g dart-dio \
    -o "$LOCAL_DART_OUTPUT" $COMMON --global-property=apis,models,supportingFiles
else
  if ! command -v docker >/dev/null 2>&1; then
    echo "OpenAPI generator belum tersedia. Jalankan 'pnpm openapi:setup' atau set OPENAPI_GENERATOR_JAR ke openapi-generator-cli v7.15.0." >&2
    exit 2
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "Docker tidak tersedia. Jalankan 'pnpm openapi:setup' untuk memasang generator lokal berbasis Java/JAR." >&2
    exit 2
  fi
  docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/local" "$IMAGE" generate \
    -i /local/docs/technical/openapi-v1.yaml -g typescript-fetch \
    -o "$TS_OUTPUT" $COMMON --global-property=apis,models,supportingFiles
  docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/local" "$IMAGE" generate \
    -i /local/docs/technical/openapi-v1.yaml -g dart-dio \
    -o "$DART_OUTPUT" $COMMON --global-property=apis,models,supportingFiles
fi

# The generated package is consumed from a Dart 3.10 workspace. Keeping the
# nested package on the generator's Dart 2.18 default makes current build_runner
# outputs use a different language version from their source libraries.
sed -i.bak "s/sdk: '>=2.18.0 <4.0.0'/sdk: '>=3.10.4 <4.0.0'/" "$DART_PUBSPEC"
rm -f "$DART_PUBSPEC.bak"

# OpenAPI Generator 7.15 emits a direct assignment for this nested built_value
# builder. Normalize it for Dart 3.10 in both sync and drift-generation modes.
CUSTOMER_BOOKING_OPTIONS="$LOCAL_DART_OUTPUT/lib/src/model/customer_booking_options.dart"
if [ -f "$CUSTOMER_BOOKING_OPTIONS" ]; then
  sed -i.bak 's/result\.slot = valueDes;/result.slot.replace(valueDes);/' "$CUSTOMER_BOOKING_OPTIONS"
  rm -f "$CUSTOMER_BOOKING_OPTIONS.bak"
fi

# dart-dio generates API smoke-test stubs that instantiate the client with the
# relative OpenAPI server URL. Dio requires an absolute URL on native Dart, so
# keep the generated tests runnable without changing the runtime client's
# explicit basePathOverride behavior.
find "$LOCAL_DART_OUTPUT/test" -type f -name '*_api_test.dart' | while IFS= read -r api_test; do
  sed -i.bak "s/final instance = Openapi()/final instance = Openapi(basePathOverride: 'http:\/\/localhost\/api\/v1')/" "$api_test"
  rm -f "$api_test.bak"
done

if [ "$MODE" = sync ]; then
  # Publish only after both generators complete successfully. OpenAPI Generator
  # does not remove files for deleted/inlined schemas, so clean only the source
  # files covered by drift checks while preserving compiled/build_runner output.
  find "$TARGET_TS_OUTPUT" -type f -name '*.ts' ! -name '*.d.ts' -delete
  find "$TARGET_DART_OUTPUT/lib" -type f -name '*.dart' ! -name '*.g.dart' -delete
  find "$TARGET_DART_OUTPUT/test" -type f -name '*.dart' -delete
  find "$TARGET_DART_OUTPUT/doc" -type f -name '*.md' -delete
  cp -R "$LOCAL_TS_OUTPUT/." "$TARGET_TS_OUTPUT/"
  cp -R "$LOCAL_DART_OUTPUT/." "$TARGET_DART_OUTPUT/"
  find "$TARGET_DART_OUTPUT/lib/src/model" -type f -name '*.g.dart' | while IFS= read -r generated; do
    source_file="${generated%.g.dart}.dart"
    if [ ! -f "$source_file" ]; then
      rm -f "$generated"
    fi
  done
fi

echo "Generated deterministic TypeScript and Dart clients ($MODE)."
