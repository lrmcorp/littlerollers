// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_access_role_assignment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserAccessRoleAssignmentSource_Enum
_$userAccessRoleAssignmentSourceEnum_DIRECT =
    const UserAccessRoleAssignmentSource_Enum._('DIRECT');
const UserAccessRoleAssignmentSource_Enum
_$userAccessRoleAssignmentSourceEnum_ASSIGNMENT =
    const UserAccessRoleAssignmentSource_Enum._('ASSIGNMENT');

UserAccessRoleAssignmentSource_Enum _$userAccessRoleAssignmentSourceEnumValueOf(
  String name,
) {
  switch (name) {
    case 'DIRECT':
      return _$userAccessRoleAssignmentSourceEnum_DIRECT;
    case 'ASSIGNMENT':
      return _$userAccessRoleAssignmentSourceEnum_ASSIGNMENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserAccessRoleAssignmentSource_Enum>
_$userAccessRoleAssignmentSourceEnumValues =
    BuiltSet<UserAccessRoleAssignmentSource_Enum>(
      const <UserAccessRoleAssignmentSource_Enum>[
        _$userAccessRoleAssignmentSourceEnum_DIRECT,
        _$userAccessRoleAssignmentSourceEnum_ASSIGNMENT,
      ],
    );

Serializer<UserAccessRoleAssignmentSource_Enum>
_$userAccessRoleAssignmentSourceEnumSerializer =
    _$UserAccessRoleAssignmentSource_EnumSerializer();

class _$UserAccessRoleAssignmentSource_EnumSerializer
    implements PrimitiveSerializer<UserAccessRoleAssignmentSource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DIRECT': 'DIRECT',
    'ASSIGNMENT': 'ASSIGNMENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DIRECT': 'DIRECT',
    'ASSIGNMENT': 'ASSIGNMENT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    UserAccessRoleAssignmentSource_Enum,
  ];
  @override
  final String wireName = 'UserAccessRoleAssignmentSource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    UserAccessRoleAssignmentSource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserAccessRoleAssignmentSource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserAccessRoleAssignmentSource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserAccessRoleAssignment extends UserAccessRoleAssignment {
  @override
  final String id;
  @override
  final String? roleId;
  @override
  final String roleCode;
  @override
  final String displayName;
  @override
  final AccessRoleScope scope;
  @override
  final String? branchId;
  @override
  final UserAccessRoleAssignmentBranch? branch;
  @override
  final UserAccessRoleAssignmentSource_Enum source_;

  factory _$UserAccessRoleAssignment([
    void Function(UserAccessRoleAssignmentBuilder)? updates,
  ]) => (UserAccessRoleAssignmentBuilder()..update(updates))._build();

  _$UserAccessRoleAssignment._({
    required this.id,
    this.roleId,
    required this.roleCode,
    required this.displayName,
    required this.scope,
    this.branchId,
    this.branch,
    required this.source_,
  }) : super._();
  @override
  UserAccessRoleAssignment rebuild(
    void Function(UserAccessRoleAssignmentBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserAccessRoleAssignmentBuilder toBuilder() =>
      UserAccessRoleAssignmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserAccessRoleAssignment &&
        id == other.id &&
        roleId == other.roleId &&
        roleCode == other.roleCode &&
        displayName == other.displayName &&
        scope == other.scope &&
        branchId == other.branchId &&
        branch == other.branch &&
        source_ == other.source_;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, roleId.hashCode);
    _$hash = $jc(_$hash, roleCode.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserAccessRoleAssignment')
          ..add('id', id)
          ..add('roleId', roleId)
          ..add('roleCode', roleCode)
          ..add('displayName', displayName)
          ..add('scope', scope)
          ..add('branchId', branchId)
          ..add('branch', branch)
          ..add('source_', source_))
        .toString();
  }
}

class UserAccessRoleAssignmentBuilder
    implements
        Builder<UserAccessRoleAssignment, UserAccessRoleAssignmentBuilder> {
  _$UserAccessRoleAssignment? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _roleId;
  String? get roleId => _$this._roleId;
  set roleId(String? roleId) => _$this._roleId = roleId;

  String? _roleCode;
  String? get roleCode => _$this._roleCode;
  set roleCode(String? roleCode) => _$this._roleCode = roleCode;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  AccessRoleScope? _scope;
  AccessRoleScope? get scope => _$this._scope;
  set scope(AccessRoleScope? scope) => _$this._scope = scope;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  UserAccessRoleAssignmentBranchBuilder? _branch;
  UserAccessRoleAssignmentBranchBuilder get branch =>
      _$this._branch ??= UserAccessRoleAssignmentBranchBuilder();
  set branch(UserAccessRoleAssignmentBranchBuilder? branch) =>
      _$this._branch = branch;

  UserAccessRoleAssignmentSource_Enum? _source_;
  UserAccessRoleAssignmentSource_Enum? get source_ => _$this._source_;
  set source_(UserAccessRoleAssignmentSource_Enum? source_) =>
      _$this._source_ = source_;

  UserAccessRoleAssignmentBuilder() {
    UserAccessRoleAssignment._defaults(this);
  }

  UserAccessRoleAssignmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _roleId = $v.roleId;
      _roleCode = $v.roleCode;
      _displayName = $v.displayName;
      _scope = $v.scope;
      _branchId = $v.branchId;
      _branch = $v.branch?.toBuilder();
      _source_ = $v.source_;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserAccessRoleAssignment other) {
    _$v = other as _$UserAccessRoleAssignment;
  }

  @override
  void update(void Function(UserAccessRoleAssignmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserAccessRoleAssignment build() => _build();

  _$UserAccessRoleAssignment _build() {
    _$UserAccessRoleAssignment _$result;
    try {
      _$result =
          _$v ??
          _$UserAccessRoleAssignment._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'UserAccessRoleAssignment',
              'id',
            ),
            roleId: roleId,
            roleCode: BuiltValueNullFieldError.checkNotNull(
              roleCode,
              r'UserAccessRoleAssignment',
              'roleCode',
            ),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'UserAccessRoleAssignment',
              'displayName',
            ),
            scope: BuiltValueNullFieldError.checkNotNull(
              scope,
              r'UserAccessRoleAssignment',
              'scope',
            ),
            branchId: branchId,
            branch: _branch?.build(),
            source_: BuiltValueNullFieldError.checkNotNull(
              source_,
              r'UserAccessRoleAssignment',
              'source_',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        _branch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserAccessRoleAssignment',
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
