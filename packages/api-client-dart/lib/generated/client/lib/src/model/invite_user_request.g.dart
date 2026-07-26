// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invite_user_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$InviteUserRequest extends InviteUserRequest {
  @override
  final String email;
  @override
  final String displayName;
  @override
  final BuiltList<UserRoleInput> roleAssignments;
  @override
  final BuiltList<Role>? roles;
  @override
  final BuiltList<String>? branchIds;

  factory _$InviteUserRequest([
    void Function(InviteUserRequestBuilder)? updates,
  ]) => (InviteUserRequestBuilder()..update(updates))._build();

  _$InviteUserRequest._({
    required this.email,
    required this.displayName,
    required this.roleAssignments,
    this.roles,
    this.branchIds,
  }) : super._();
  @override
  InviteUserRequest rebuild(void Function(InviteUserRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  InviteUserRequestBuilder toBuilder() =>
      InviteUserRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is InviteUserRequest &&
        email == other.email &&
        displayName == other.displayName &&
        roleAssignments == other.roleAssignments &&
        roles == other.roles &&
        branchIds == other.branchIds;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, roleAssignments.hashCode);
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'InviteUserRequest')
          ..add('email', email)
          ..add('displayName', displayName)
          ..add('roleAssignments', roleAssignments)
          ..add('roles', roles)
          ..add('branchIds', branchIds))
        .toString();
  }
}

class InviteUserRequestBuilder
    implements Builder<InviteUserRequest, InviteUserRequestBuilder> {
  _$InviteUserRequest? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  ListBuilder<UserRoleInput>? _roleAssignments;
  ListBuilder<UserRoleInput> get roleAssignments =>
      _$this._roleAssignments ??= ListBuilder<UserRoleInput>();
  set roleAssignments(ListBuilder<UserRoleInput>? roleAssignments) =>
      _$this._roleAssignments = roleAssignments;

  ListBuilder<Role>? _roles;
  ListBuilder<Role> get roles => _$this._roles ??= ListBuilder<Role>();
  set roles(ListBuilder<Role>? roles) => _$this._roles = roles;

  ListBuilder<String>? _branchIds;
  ListBuilder<String> get branchIds =>
      _$this._branchIds ??= ListBuilder<String>();
  set branchIds(ListBuilder<String>? branchIds) =>
      _$this._branchIds = branchIds;

  InviteUserRequestBuilder() {
    InviteUserRequest._defaults(this);
  }

  InviteUserRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _displayName = $v.displayName;
      _roleAssignments = $v.roleAssignments.toBuilder();
      _roles = $v.roles?.toBuilder();
      _branchIds = $v.branchIds?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(InviteUserRequest other) {
    _$v = other as _$InviteUserRequest;
  }

  @override
  void update(void Function(InviteUserRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  InviteUserRequest build() => _build();

  _$InviteUserRequest _build() {
    _$InviteUserRequest _$result;
    try {
      _$result =
          _$v ??
          _$InviteUserRequest._(
            email: BuiltValueNullFieldError.checkNotNull(
              email,
              r'InviteUserRequest',
              'email',
            ),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'InviteUserRequest',
              'displayName',
            ),
            roleAssignments: roleAssignments.build(),
            roles: _roles?.build(),
            branchIds: _branchIds?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roleAssignments';
        roleAssignments.build();
        _$failedField = 'roles';
        _roles?.build();
        _$failedField = 'branchIds';
        _branchIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'InviteUserRequest',
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
