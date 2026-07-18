// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_batch_action_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MigrationBatchActionCommand extends MigrationBatchActionCommand {
  @override
  final int expectedVersion;
  @override
  final String controlHash;
  @override
  final String reason;

  factory _$MigrationBatchActionCommand([
    void Function(MigrationBatchActionCommandBuilder)? updates,
  ]) => (MigrationBatchActionCommandBuilder()..update(updates))._build();

  _$MigrationBatchActionCommand._({
    required this.expectedVersion,
    required this.controlHash,
    required this.reason,
  }) : super._();
  @override
  MigrationBatchActionCommand rebuild(
    void Function(MigrationBatchActionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationBatchActionCommandBuilder toBuilder() =>
      MigrationBatchActionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationBatchActionCommand &&
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
    return (newBuiltValueToStringHelper(r'MigrationBatchActionCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('controlHash', controlHash)
          ..add('reason', reason))
        .toString();
  }
}

class MigrationBatchActionCommandBuilder
    implements
        Builder<
          MigrationBatchActionCommand,
          MigrationBatchActionCommandBuilder
        > {
  _$MigrationBatchActionCommand? _$v;

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

  MigrationBatchActionCommandBuilder() {
    MigrationBatchActionCommand._defaults(this);
  }

  MigrationBatchActionCommandBuilder get _$this {
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
  void replace(MigrationBatchActionCommand other) {
    _$v = other as _$MigrationBatchActionCommand;
  }

  @override
  void update(void Function(MigrationBatchActionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationBatchActionCommand build() => _build();

  _$MigrationBatchActionCommand _build() {
    final _$result =
        _$v ??
        _$MigrationBatchActionCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'MigrationBatchActionCommand',
            'expectedVersion',
          ),
          controlHash: BuiltValueNullFieldError.checkNotNull(
            controlHash,
            r'MigrationBatchActionCommand',
            'controlHash',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'MigrationBatchActionCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
