// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_role_assignment_input.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccessRoleAssignmentInput extends AccessRoleAssignmentInput {
  @override
  final String roleId;
  @override
  final String? branchId;

  factory _$AccessRoleAssignmentInput([
    void Function(AccessRoleAssignmentInputBuilder)? updates,
  ]) => (AccessRoleAssignmentInputBuilder()..update(updates))._build();

  _$AccessRoleAssignmentInput._({required this.roleId, this.branchId})
    : super._();
  @override
  AccessRoleAssignmentInput rebuild(
    void Function(AccessRoleAssignmentInputBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AccessRoleAssignmentInputBuilder toBuilder() =>
      AccessRoleAssignmentInputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccessRoleAssignmentInput &&
        roleId == other.roleId &&
        branchId == other.branchId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, roleId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccessRoleAssignmentInput')
          ..add('roleId', roleId)
          ..add('branchId', branchId))
        .toString();
  }
}

class AccessRoleAssignmentInputBuilder
    implements
        Builder<AccessRoleAssignmentInput, AccessRoleAssignmentInputBuilder> {
  _$AccessRoleAssignmentInput? _$v;

  String? _roleId;
  String? get roleId => _$this._roleId;
  set roleId(String? roleId) => _$this._roleId = roleId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  AccessRoleAssignmentInputBuilder() {
    AccessRoleAssignmentInput._defaults(this);
  }

  AccessRoleAssignmentInputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _roleId = $v.roleId;
      _branchId = $v.branchId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccessRoleAssignmentInput other) {
    _$v = other as _$AccessRoleAssignmentInput;
  }

  @override
  void update(void Function(AccessRoleAssignmentInputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccessRoleAssignmentInput build() => _build();

  _$AccessRoleAssignmentInput _build() {
    final _$result =
        _$v ??
        _$AccessRoleAssignmentInput._(
          roleId: BuiltValueNullFieldError.checkNotNull(
            roleId,
            r'AccessRoleAssignmentInput',
            'roleId',
          ),
          branchId: branchId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
