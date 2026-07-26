// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_user_roles_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateUserRolesCommand extends UpdateUserRolesCommand {
  @override
  final BuiltList<UserRoleInput> roles;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$UpdateUserRolesCommand([
    void Function(UpdateUserRolesCommandBuilder)? updates,
  ]) => (UpdateUserRolesCommandBuilder()..update(updates))._build();

  _$UpdateUserRolesCommand._({
    required this.roles,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  UpdateUserRolesCommand rebuild(
    void Function(UpdateUserRolesCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UpdateUserRolesCommandBuilder toBuilder() =>
      UpdateUserRolesCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateUserRolesCommand &&
        roles == other.roles &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateUserRolesCommand')
          ..add('roles', roles)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class UpdateUserRolesCommandBuilder
    implements Builder<UpdateUserRolesCommand, UpdateUserRolesCommandBuilder> {
  _$UpdateUserRolesCommand? _$v;

  ListBuilder<UserRoleInput>? _roles;
  ListBuilder<UserRoleInput> get roles =>
      _$this._roles ??= ListBuilder<UserRoleInput>();
  set roles(ListBuilder<UserRoleInput>? roles) => _$this._roles = roles;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  UpdateUserRolesCommandBuilder() {
    UpdateUserRolesCommand._defaults(this);
  }

  UpdateUserRolesCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _roles = $v.roles.toBuilder();
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateUserRolesCommand other) {
    _$v = other as _$UpdateUserRolesCommand;
  }

  @override
  void update(void Function(UpdateUserRolesCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateUserRolesCommand build() => _build();

  _$UpdateUserRolesCommand _build() {
    _$UpdateUserRolesCommand _$result;
    try {
      _$result =
          _$v ??
          _$UpdateUserRolesCommand._(
            roles: roles.build(),
            expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion,
              r'UpdateUserRolesCommand',
              'expectedVersion',
            ),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'UpdateUserRolesCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roles';
        roles.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UpdateUserRolesCommand',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
