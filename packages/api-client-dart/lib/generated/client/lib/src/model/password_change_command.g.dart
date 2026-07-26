// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_change_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PasswordChangeCommand extends PasswordChangeCommand {
  @override
  final String currentPassword;
  @override
  final String newPassword;

  factory _$PasswordChangeCommand([
    void Function(PasswordChangeCommandBuilder)? updates,
  ]) => (PasswordChangeCommandBuilder()..update(updates))._build();

  _$PasswordChangeCommand._({
    required this.currentPassword,
    required this.newPassword,
  }) : super._();
  @override
  PasswordChangeCommand rebuild(
    void Function(PasswordChangeCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PasswordChangeCommandBuilder toBuilder() =>
      PasswordChangeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordChangeCommand &&
        currentPassword == other.currentPassword &&
        newPassword == other.newPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, currentPassword.hashCode);
    _$hash = $jc(_$hash, newPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordChangeCommand')
          ..add('currentPassword', currentPassword)
          ..add('newPassword', newPassword))
        .toString();
  }
}

class PasswordChangeCommandBuilder
    implements Builder<PasswordChangeCommand, PasswordChangeCommandBuilder> {
  _$PasswordChangeCommand? _$v;

  String? _currentPassword;
  String? get currentPassword => _$this._currentPassword;
  set currentPassword(String? currentPassword) =>
      _$this._currentPassword = currentPassword;

  String? _newPassword;
  String? get newPassword => _$this._newPassword;
  set newPassword(String? newPassword) => _$this._newPassword = newPassword;

  PasswordChangeCommandBuilder() {
    PasswordChangeCommand._defaults(this);
  }

  PasswordChangeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _currentPassword = $v.currentPassword;
      _newPassword = $v.newPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordChangeCommand other) {
    _$v = other as _$PasswordChangeCommand;
  }

  @override
  void update(void Function(PasswordChangeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordChangeCommand build() => _build();

  _$PasswordChangeCommand _build() {
    final _$result =
        _$v ??
        _$PasswordChangeCommand._(
          currentPassword: BuiltValueNullFieldError.checkNotNull(
            currentPassword,
            r'PasswordChangeCommand',
            'currentPassword',
          ),
          newPassword: BuiltValueNullFieldError.checkNotNull(
            newPassword,
            r'PasswordChangeCommand',
            'newPassword',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
