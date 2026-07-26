// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_role_input.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserRoleInput extends UserRoleInput {
  @override
  final Role role;
  @override
  final String? branchId;

  factory _$UserRoleInput([void Function(UserRoleInputBuilder)? updates]) =>
      (UserRoleInputBuilder()..update(updates))._build();

  _$UserRoleInput._({required this.role, this.branchId}) : super._();
  @override
  UserRoleInput rebuild(void Function(UserRoleInputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserRoleInputBuilder toBuilder() => UserRoleInputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserRoleInput &&
        role == other.role &&
        branchId == other.branchId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserRoleInput')
          ..add('role', role)
          ..add('branchId', branchId))
        .toString();
  }
}

class UserRoleInputBuilder
    implements Builder<UserRoleInput, UserRoleInputBuilder> {
  _$UserRoleInput? _$v;

  Role? _role;
  Role? get role => _$this._role;
  set role(Role? role) => _$this._role = role;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  UserRoleInputBuilder() {
    UserRoleInput._defaults(this);
  }

  UserRoleInputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _role = $v.role;
      _branchId = $v.branchId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserRoleInput other) {
    _$v = other as _$UserRoleInput;
  }

  @override
  void update(void Function(UserRoleInputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserRoleInput build() => _build();

  _$UserRoleInput _build() {
    final _$result =
        _$v ??
        _$UserRoleInput._(
          role: BuiltValueNullFieldError.checkNotNull(
            role,
            r'UserRoleInput',
            'role',
          ),
          branchId: branchId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
