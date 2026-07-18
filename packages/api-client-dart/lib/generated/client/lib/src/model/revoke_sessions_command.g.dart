// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revoke_sessions_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RevokeSessionsCommand extends RevokeSessionsCommand {
  @override
  final bool? exceptCurrent;
  @override
  final String reason;

  factory _$RevokeSessionsCommand([
    void Function(RevokeSessionsCommandBuilder)? updates,
  ]) => (RevokeSessionsCommandBuilder()..update(updates))._build();

  _$RevokeSessionsCommand._({this.exceptCurrent, required this.reason})
    : super._();
  @override
  RevokeSessionsCommand rebuild(
    void Function(RevokeSessionsCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RevokeSessionsCommandBuilder toBuilder() =>
      RevokeSessionsCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RevokeSessionsCommand &&
        exceptCurrent == other.exceptCurrent &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, exceptCurrent.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RevokeSessionsCommand')
          ..add('exceptCurrent', exceptCurrent)
          ..add('reason', reason))
        .toString();
  }
}

class RevokeSessionsCommandBuilder
    implements Builder<RevokeSessionsCommand, RevokeSessionsCommandBuilder> {
  _$RevokeSessionsCommand? _$v;

  bool? _exceptCurrent;
  bool? get exceptCurrent => _$this._exceptCurrent;
  set exceptCurrent(bool? exceptCurrent) =>
      _$this._exceptCurrent = exceptCurrent;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  RevokeSessionsCommandBuilder() {
    RevokeSessionsCommand._defaults(this);
  }

  RevokeSessionsCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _exceptCurrent = $v.exceptCurrent;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RevokeSessionsCommand other) {
    _$v = other as _$RevokeSessionsCommand;
  }

  @override
  void update(void Function(RevokeSessionsCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RevokeSessionsCommand build() => _build();

  _$RevokeSessionsCommand _build() {
    final _$result =
        _$v ??
        _$RevokeSessionsCommand._(
          exceptCurrent: exceptCurrent,
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'RevokeSessionsCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
