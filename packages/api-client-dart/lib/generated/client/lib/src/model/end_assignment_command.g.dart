// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'end_assignment_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EndAssignmentCommand extends EndAssignmentCommand {
  @override
  final DateTime effectiveAt;
  @override
  final String reason;
  @override
  final int expectedVersion;

  factory _$EndAssignmentCommand([
    void Function(EndAssignmentCommandBuilder)? updates,
  ]) => (EndAssignmentCommandBuilder()..update(updates))._build();

  _$EndAssignmentCommand._({
    required this.effectiveAt,
    required this.reason,
    required this.expectedVersion,
  }) : super._();
  @override
  EndAssignmentCommand rebuild(
    void Function(EndAssignmentCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  EndAssignmentCommandBuilder toBuilder() =>
      EndAssignmentCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EndAssignmentCommand &&
        effectiveAt == other.effectiveAt &&
        reason == other.reason &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, effectiveAt.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EndAssignmentCommand')
          ..add('effectiveAt', effectiveAt)
          ..add('reason', reason)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class EndAssignmentCommandBuilder
    implements Builder<EndAssignmentCommand, EndAssignmentCommandBuilder> {
  _$EndAssignmentCommand? _$v;

  DateTime? _effectiveAt;
  DateTime? get effectiveAt => _$this._effectiveAt;
  set effectiveAt(DateTime? effectiveAt) => _$this._effectiveAt = effectiveAt;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  EndAssignmentCommandBuilder() {
    EndAssignmentCommand._defaults(this);
  }

  EndAssignmentCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _effectiveAt = $v.effectiveAt;
      _reason = $v.reason;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EndAssignmentCommand other) {
    _$v = other as _$EndAssignmentCommand;
  }

  @override
  void update(void Function(EndAssignmentCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EndAssignmentCommand build() => _build();

  _$EndAssignmentCommand _build() {
    final _$result =
        _$v ??
        _$EndAssignmentCommand._(
          effectiveAt: BuiltValueNullFieldError.checkNotNull(
            effectiveAt,
            r'EndAssignmentCommand',
            'effectiveAt',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'EndAssignmentCommand',
            'reason',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'EndAssignmentCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
