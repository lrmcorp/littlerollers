import 'package:dailydose_api_client/dailydose_api_client.dart';
import 'package:openapi/openapi.dart' as generated;
import 'package:test/test.dart';

void main() {
  test('representative contract compiles', () {
    expect(contractVersion, '0.4.0-draft');
    expect(const CursorPageMeta(hasMore: false).hasMore, isFalse);
    expect(
      const IdempotentCommandOptions(
        idempotencyKey: '1234567890123456',
      ).idempotencyKey,
      isNotEmpty,
    );
    expect(
      Session(
        assurance: 'BASE',
        channel: 'MOBILE',
        expiresAt: DateTime.utc(2026),
      ).channel,
      'MOBILE',
    );
    final version = generated.ClassSlotVersionCommand(
      (builder) => builder.expectedVersion = 2,
    );
    final cancellation = generated.ClassSlotCancellationCommand(
      (builder) => builder
        ..expectedVersion = 2
        ..reasonCode = generated
            .ClassSlotCancellationCommandReasonCodeEnum
            .OTHER_REVIEW_REQUIRED,
    );
    expect(version.expectedVersion, 2);
    expect(
      cancellation.reasonCode,
    generated.ClassSlotCancellationCommandReasonCodeEnum.OTHER_REVIEW_REQUIRED,
    );
  });
}
