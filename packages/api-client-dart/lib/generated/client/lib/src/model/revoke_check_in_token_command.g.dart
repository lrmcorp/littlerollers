// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revoke_check_in_token_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RevokeCheckInTokenCommand extends RevokeCheckInTokenCommand {
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$RevokeCheckInTokenCommand([
    void Function(RevokeCheckInTokenCommandBuilder)? updates,
  ]) => (RevokeCheckInTokenCommandBuilder()..update(updates))._build();

  _$RevokeCheckInTokenCommand._({
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  RevokeCheckInTokenCommand rebuild(
    void Function(RevokeCheckInTokenCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RevokeCheckInTokenCommandBuilder toBuilder() =>
      RevokeCheckInTokenCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RevokeCheckInTokenCommand &&
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
    return (newBuiltValueToStringHelper(r'RevokeCheckInTokenCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class RevokeCheckInTokenCommandBuilder
    implements
        Builder<RevokeCheckInTokenCommand, RevokeCheckInTokenCommandBuilder> {
  _$RevokeCheckInTokenCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  RevokeCheckInTokenCommandBuilder() {
    RevokeCheckInTokenCommand._defaults(this);
  }

  RevokeCheckInTokenCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RevokeCheckInTokenCommand other) {
    _$v = other as _$RevokeCheckInTokenCommand;
  }

  @override
  void update(void Function(RevokeCheckInTokenCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RevokeCheckInTokenCommand build() => _build();

  _$RevokeCheckInTokenCommand _build() {
    final _$result =
        _$v ??
        _$RevokeCheckInTokenCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'RevokeCheckInTokenCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'RevokeCheckInTokenCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
