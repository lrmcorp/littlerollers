// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quota_evaluation_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuotaEvaluationCommand extends QuotaEvaluationCommand {
  @override
  final DateTime expectedDueAt;
  @override
  final int expectedVersion;
  @override
  final String? reason;

  factory _$QuotaEvaluationCommand([
    void Function(QuotaEvaluationCommandBuilder)? updates,
  ]) => (QuotaEvaluationCommandBuilder()..update(updates))._build();

  _$QuotaEvaluationCommand._({
    required this.expectedDueAt,
    required this.expectedVersion,
    this.reason,
  }) : super._();
  @override
  QuotaEvaluationCommand rebuild(
    void Function(QuotaEvaluationCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  QuotaEvaluationCommandBuilder toBuilder() =>
      QuotaEvaluationCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuotaEvaluationCommand &&
        expectedDueAt == other.expectedDueAt &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedDueAt.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuotaEvaluationCommand')
          ..add('expectedDueAt', expectedDueAt)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class QuotaEvaluationCommandBuilder
    implements Builder<QuotaEvaluationCommand, QuotaEvaluationCommandBuilder> {
  _$QuotaEvaluationCommand? _$v;

  DateTime? _expectedDueAt;
  DateTime? get expectedDueAt => _$this._expectedDueAt;
  set expectedDueAt(DateTime? expectedDueAt) =>
      _$this._expectedDueAt = expectedDueAt;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  QuotaEvaluationCommandBuilder() {
    QuotaEvaluationCommand._defaults(this);
  }

  QuotaEvaluationCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedDueAt = $v.expectedDueAt;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuotaEvaluationCommand other) {
    _$v = other as _$QuotaEvaluationCommand;
  }

  @override
  void update(void Function(QuotaEvaluationCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuotaEvaluationCommand build() => _build();

  _$QuotaEvaluationCommand _build() {
    final _$result =
        _$v ??
        _$QuotaEvaluationCommand._(
          expectedDueAt: BuiltValueNullFieldError.checkNotNull(
            expectedDueAt,
            r'QuotaEvaluationCommand',
            'expectedDueAt',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'QuotaEvaluationCommand',
            'expectedVersion',
          ),
          reason: reason,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
