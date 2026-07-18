// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'backfill_customer_check_in_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BackfillCustomerCheckInRequest extends BackfillCustomerCheckInRequest {
  @override
  final String bookingId;
  @override
  final String reason;
  @override
  final int? expectedVersion;

  factory _$BackfillCustomerCheckInRequest([
    void Function(BackfillCustomerCheckInRequestBuilder)? updates,
  ]) => (BackfillCustomerCheckInRequestBuilder()..update(updates))._build();

  _$BackfillCustomerCheckInRequest._({
    required this.bookingId,
    required this.reason,
    this.expectedVersion,
  }) : super._();
  @override
  BackfillCustomerCheckInRequest rebuild(
    void Function(BackfillCustomerCheckInRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BackfillCustomerCheckInRequestBuilder toBuilder() =>
      BackfillCustomerCheckInRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BackfillCustomerCheckInRequest &&
        bookingId == other.bookingId &&
        reason == other.reason &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BackfillCustomerCheckInRequest')
          ..add('bookingId', bookingId)
          ..add('reason', reason)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class BackfillCustomerCheckInRequestBuilder
    implements
        Builder<
          BackfillCustomerCheckInRequest,
          BackfillCustomerCheckInRequestBuilder
        > {
  _$BackfillCustomerCheckInRequest? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  BackfillCustomerCheckInRequestBuilder() {
    BackfillCustomerCheckInRequest._defaults(this);
  }

  BackfillCustomerCheckInRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _reason = $v.reason;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BackfillCustomerCheckInRequest other) {
    _$v = other as _$BackfillCustomerCheckInRequest;
  }

  @override
  void update(void Function(BackfillCustomerCheckInRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BackfillCustomerCheckInRequest build() => _build();

  _$BackfillCustomerCheckInRequest _build() {
    final _$result =
        _$v ??
        _$BackfillCustomerCheckInRequest._(
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'BackfillCustomerCheckInRequest',
            'bookingId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'BackfillCustomerCheckInRequest',
            'reason',
          ),
          expectedVersion: expectedVersion,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
