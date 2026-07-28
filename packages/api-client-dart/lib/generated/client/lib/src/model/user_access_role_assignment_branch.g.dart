// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_access_role_assignment_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserAccessRoleAssignmentBranch extends UserAccessRoleAssignmentBranch {
  @override
  final String? id;
  @override
  final String? code;
  @override
  final String? name;

  factory _$UserAccessRoleAssignmentBranch([
    void Function(UserAccessRoleAssignmentBranchBuilder)? updates,
  ]) => (UserAccessRoleAssignmentBranchBuilder()..update(updates))._build();

  _$UserAccessRoleAssignmentBranch._({this.id, this.code, this.name})
    : super._();
  @override
  UserAccessRoleAssignmentBranch rebuild(
    void Function(UserAccessRoleAssignmentBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserAccessRoleAssignmentBranchBuilder toBuilder() =>
      UserAccessRoleAssignmentBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserAccessRoleAssignmentBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserAccessRoleAssignmentBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class UserAccessRoleAssignmentBranchBuilder
    implements
        Builder<
          UserAccessRoleAssignmentBranch,
          UserAccessRoleAssignmentBranchBuilder
        > {
  _$UserAccessRoleAssignmentBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  UserAccessRoleAssignmentBranchBuilder() {
    UserAccessRoleAssignmentBranch._defaults(this);
  }

  UserAccessRoleAssignmentBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserAccessRoleAssignmentBranch other) {
    _$v = other as _$UserAccessRoleAssignmentBranch;
  }

  @override
  void update(void Function(UserAccessRoleAssignmentBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserAccessRoleAssignmentBranch build() => _build();

  _$UserAccessRoleAssignmentBranch _build() {
    final _$result =
        _$v ??
        _$UserAccessRoleAssignmentBranch._(id: id, code: code, name: name);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
