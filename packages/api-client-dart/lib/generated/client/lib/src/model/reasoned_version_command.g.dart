// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reasoned_version_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReasonedVersionCommand extends ReasonedVersionCommand {
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$ReasonedVersionCommand([
    void Function(ReasonedVersionCommandBuilder)? updates,
  ]) => (ReasonedVersionCommandBuilder()..update(updates))._build();

  _$ReasonedVersionCommand._({
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  ReasonedVersionCommand rebuild(
    void Function(ReasonedVersionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReasonedVersionCommandBuilder toBuilder() =>
      ReasonedVersionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReasonedVersionCommand &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReasonedVersionCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class ReasonedVersionCommandBuilder
    implements Builder<ReasonedVersionCommand, ReasonedVersionCommandBuilder> {
  _$ReasonedVersionCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  ReasonedVersionCommandBuilder() {
    ReasonedVersionCommand._defaults(this);
  }

  ReasonedVersionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReasonedVersionCommand other) {
    _$v = other as _$ReasonedVersionCommand;
  }

  @override
  void update(void Function(ReasonedVersionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReasonedVersionCommand build() => _build();

  _$ReasonedVersionCommand _build() {
    final _$result =
        _$v ??
        _$ReasonedVersionCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ReasonedVersionCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'ReasonedVersionCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
