// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'close_month_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CloseMonthRequest extends CloseMonthRequest {
  @override
  final String branchId;
  @override
  final String period;
  @override
  final String controlHash;
  @override
  final String reason;
  @override
  final int expectedVersion;

  factory _$CloseMonthRequest([
    void Function(CloseMonthRequestBuilder)? updates,
  ]) => (CloseMonthRequestBuilder()..update(updates))._build();

  _$CloseMonthRequest._({
    required this.branchId,
    required this.period,
    required this.controlHash,
    required this.reason,
    required this.expectedVersion,
  }) : super._();
  @override
  CloseMonthRequest rebuild(void Function(CloseMonthRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CloseMonthRequestBuilder toBuilder() =>
      CloseMonthRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CloseMonthRequest &&
        branchId == other.branchId &&
        period == other.period &&
        controlHash == other.controlHash &&
        reason == other.reason &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, controlHash.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CloseMonthRequest')
          ..add('branchId', branchId)
          ..add('period', period)
          ..add('controlHash', controlHash)
          ..add('reason', reason)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class CloseMonthRequestBuilder
    implements Builder<CloseMonthRequest, CloseMonthRequestBuilder> {
  _$CloseMonthRequest? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _period;
  String? get period => _$this._period;
  set period(String? period) => _$this._period = period;

  String? _controlHash;
  String? get controlHash => _$this._controlHash;
  set controlHash(String? controlHash) => _$this._controlHash = controlHash;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  CloseMonthRequestBuilder() {
    CloseMonthRequest._defaults(this);
  }

  CloseMonthRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _period = $v.period;
      _controlHash = $v.controlHash;
      _reason = $v.reason;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CloseMonthRequest other) {
    _$v = other as _$CloseMonthRequest;
  }

  @override
  void update(void Function(CloseMonthRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CloseMonthRequest build() => _build();

  _$CloseMonthRequest _build() {
    final _$result =
        _$v ??
        _$CloseMonthRequest._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'CloseMonthRequest',
            'branchId',
          ),
          period: BuiltValueNullFieldError.checkNotNull(
            period,
            r'CloseMonthRequest',
            'period',
          ),
          controlHash: BuiltValueNullFieldError.checkNotNull(
            controlHash,
            r'CloseMonthRequest',
            'controlHash',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'CloseMonthRequest',
            'reason',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'CloseMonthRequest',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
