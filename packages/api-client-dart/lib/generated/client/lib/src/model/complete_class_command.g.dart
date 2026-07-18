// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'complete_class_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CompleteClassCommand extends CompleteClassCommand {
  @override
  final int expectedVersion;
  @override
  final String controlHash;
  @override
  final String reason;

  factory _$CompleteClassCommand([
    void Function(CompleteClassCommandBuilder)? updates,
  ]) => (CompleteClassCommandBuilder()..update(updates))._build();

  _$CompleteClassCommand._({
    required this.expectedVersion,
    required this.controlHash,
    required this.reason,
  }) : super._();
  @override
  CompleteClassCommand rebuild(
    void Function(CompleteClassCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CompleteClassCommandBuilder toBuilder() =>
      CompleteClassCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CompleteClassCommand &&
        expectedVersion == other.expectedVersion &&
        controlHash == other.controlHash &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, controlHash.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CompleteClassCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('controlHash', controlHash)
          ..add('reason', reason))
        .toString();
  }
}

class CompleteClassCommandBuilder
    implements Builder<CompleteClassCommand, CompleteClassCommandBuilder> {
  _$CompleteClassCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _controlHash;
  String? get controlHash => _$this._controlHash;
  set controlHash(String? controlHash) => _$this._controlHash = controlHash;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  CompleteClassCommandBuilder() {
    CompleteClassCommand._defaults(this);
  }

  CompleteClassCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _controlHash = $v.controlHash;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CompleteClassCommand other) {
    _$v = other as _$CompleteClassCommand;
  }

  @override
  void update(void Function(CompleteClassCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CompleteClassCommand build() => _build();

  _$CompleteClassCommand _build() {
    final _$result =
        _$v ??
        _$CompleteClassCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'CompleteClassCommand',
            'expectedVersion',
          ),
          controlHash: BuiltValueNullFieldError.checkNotNull(
            controlHash,
            r'CompleteClassCommand',
            'controlHash',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'CompleteClassCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
