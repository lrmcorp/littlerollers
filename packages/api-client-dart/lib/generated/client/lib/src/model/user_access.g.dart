// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_access.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserAccess extends UserAccess {
  @override
  final UserAccessUser user;
  @override
  final BuiltList<UserAccessRoleAssignment> roleAssignments;
  @override
  final BuiltList<UserPermissionOverride> overrides;
  @override
  final UserAccessEffective effective;

  factory _$UserAccess([void Function(UserAccessBuilder)? updates]) =>
      (UserAccessBuilder()..update(updates))._build();

  _$UserAccess._({
    required this.user,
    required this.roleAssignments,
    required this.overrides,
    required this.effective,
  }) : super._();
  @override
  UserAccess rebuild(void Function(UserAccessBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserAccessBuilder toBuilder() => UserAccessBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserAccess &&
        user == other.user &&
        roleAssignments == other.roleAssignments &&
        overrides == other.overrides &&
        effective == other.effective;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, user.hashCode);
    _$hash = $jc(_$hash, roleAssignments.hashCode);
    _$hash = $jc(_$hash, overrides.hashCode);
    _$hash = $jc(_$hash, effective.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserAccess')
          ..add('user', user)
          ..add('roleAssignments', roleAssignments)
          ..add('overrides', overrides)
          ..add('effective', effective))
        .toString();
  }
}

class UserAccessBuilder implements Builder<UserAccess, UserAccessBuilder> {
  _$UserAccess? _$v;

  UserAccessUserBuilder? _user;
  UserAccessUserBuilder get user => _$this._user ??= UserAccessUserBuilder();
  set user(UserAccessUserBuilder? user) => _$this._user = user;

  ListBuilder<UserAccessRoleAssignment>? _roleAssignments;
  ListBuilder<UserAccessRoleAssignment> get roleAssignments =>
      _$this._roleAssignments ??= ListBuilder<UserAccessRoleAssignment>();
  set roleAssignments(ListBuilder<UserAccessRoleAssignment>? roleAssignments) =>
      _$this._roleAssignments = roleAssignments;

  ListBuilder<UserPermissionOverride>? _overrides;
  ListBuilder<UserPermissionOverride> get overrides =>
      _$this._overrides ??= ListBuilder<UserPermissionOverride>();
  set overrides(ListBuilder<UserPermissionOverride>? overrides) =>
      _$this._overrides = overrides;

  UserAccessEffectiveBuilder? _effective;
  UserAccessEffectiveBuilder get effective =>
      _$this._effective ??= UserAccessEffectiveBuilder();
  set effective(UserAccessEffectiveBuilder? effective) =>
      _$this._effective = effective;

  UserAccessBuilder() {
    UserAccess._defaults(this);
  }

  UserAccessBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _user = $v.user.toBuilder();
      _roleAssignments = $v.roleAssignments.toBuilder();
      _overrides = $v.overrides.toBuilder();
      _effective = $v.effective.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserAccess other) {
    _$v = other as _$UserAccess;
  }

  @override
  void update(void Function(UserAccessBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserAccess build() => _build();

  _$UserAccess _build() {
    _$UserAccess _$result;
    try {
      _$result =
          _$v ??
          _$UserAccess._(
            user: user.build(),
            roleAssignments: roleAssignments.build(),
            overrides: overrides.build(),
            effective: effective.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'user';
        user.build();
        _$failedField = 'roleAssignments';
        roleAssignments.build();
        _$failedField = 'overrides';
        overrides.build();
        _$failedField = 'effective';
        effective.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserAccess',
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
