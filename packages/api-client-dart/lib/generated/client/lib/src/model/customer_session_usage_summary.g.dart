// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_session_usage_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerSessionUsageSummary extends CustomerSessionUsageSummary {
  @override
  final int initialSessions;
  @override
  final int usedSessions;
  @override
  final int reversedSessions;
  @override
  final int adjustmentDelta;

  factory _$CustomerSessionUsageSummary([
    void Function(CustomerSessionUsageSummaryBuilder)? updates,
  ]) => (CustomerSessionUsageSummaryBuilder()..update(updates))._build();

  _$CustomerSessionUsageSummary._({
    required this.initialSessions,
    required this.usedSessions,
    required this.reversedSessions,
    required this.adjustmentDelta,
  }) : super._();
  @override
  CustomerSessionUsageSummary rebuild(
    void Function(CustomerSessionUsageSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerSessionUsageSummaryBuilder toBuilder() =>
      CustomerSessionUsageSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerSessionUsageSummary &&
        initialSessions == other.initialSessions &&
        usedSessions == other.usedSessions &&
        reversedSessions == other.reversedSessions &&
        adjustmentDelta == other.adjustmentDelta;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, initialSessions.hashCode);
    _$hash = $jc(_$hash, usedSessions.hashCode);
    _$hash = $jc(_$hash, reversedSessions.hashCode);
    _$hash = $jc(_$hash, adjustmentDelta.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerSessionUsageSummary')
          ..add('initialSessions', initialSessions)
          ..add('usedSessions', usedSessions)
          ..add('reversedSessions', reversedSessions)
          ..add('adjustmentDelta', adjustmentDelta))
        .toString();
  }
}

class CustomerSessionUsageSummaryBuilder
    implements
        Builder<
          CustomerSessionUsageSummary,
          CustomerSessionUsageSummaryBuilder
        > {
  _$CustomerSessionUsageSummary? _$v;

  int? _initialSessions;
  int? get initialSessions => _$this._initialSessions;
  set initialSessions(int? initialSessions) =>
      _$this._initialSessions = initialSessions;

  int? _usedSessions;
  int? get usedSessions => _$this._usedSessions;
  set usedSessions(int? usedSessions) => _$this._usedSessions = usedSessions;

  int? _reversedSessions;
  int? get reversedSessions => _$this._reversedSessions;
  set reversedSessions(int? reversedSessions) =>
      _$this._reversedSessions = reversedSessions;

  int? _adjustmentDelta;
  int? get adjustmentDelta => _$this._adjustmentDelta;
  set adjustmentDelta(int? adjustmentDelta) =>
      _$this._adjustmentDelta = adjustmentDelta;

  CustomerSessionUsageSummaryBuilder() {
    CustomerSessionUsageSummary._defaults(this);
  }

  CustomerSessionUsageSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _initialSessions = $v.initialSessions;
      _usedSessions = $v.usedSessions;
      _reversedSessions = $v.reversedSessions;
      _adjustmentDelta = $v.adjustmentDelta;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerSessionUsageSummary other) {
    _$v = other as _$CustomerSessionUsageSummary;
  }

  @override
  void update(void Function(CustomerSessionUsageSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerSessionUsageSummary build() => _build();

  _$CustomerSessionUsageSummary _build() {
    final _$result =
        _$v ??
        _$CustomerSessionUsageSummary._(
          initialSessions: BuiltValueNullFieldError.checkNotNull(
            initialSessions,
            r'CustomerSessionUsageSummary',
            'initialSessions',
          ),
          usedSessions: BuiltValueNullFieldError.checkNotNull(
            usedSessions,
            r'CustomerSessionUsageSummary',
            'usedSessions',
          ),
          reversedSessions: BuiltValueNullFieldError.checkNotNull(
            reversedSessions,
            r'CustomerSessionUsageSummary',
            'reversedSessions',
          ),
          adjustmentDelta: BuiltValueNullFieldError.checkNotNull(
            adjustmentDelta,
            r'CustomerSessionUsageSummary',
            'adjustmentDelta',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
