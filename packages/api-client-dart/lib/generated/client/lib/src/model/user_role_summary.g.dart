// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_role_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserRoleSummarySource_Enum _$userRoleSummarySourceEnum_DIRECT =
    const UserRoleSummarySource_Enum._('DIRECT');
const UserRoleSummarySource_Enum _$userRoleSummarySourceEnum_ASSIGNMENT =
    const UserRoleSummarySource_Enum._('ASSIGNMENT');

UserRoleSummarySource_Enum _$userRoleSummarySourceEnumValueOf(String name) {
  switch (name) {
    case 'DIRECT':
      return _$userRoleSummarySourceEnum_DIRECT;
    case 'ASSIGNMENT':
      return _$userRoleSummarySourceEnum_ASSIGNMENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserRoleSummarySource_Enum> _$userRoleSummarySourceEnumValues =
    BuiltSet<UserRoleSummarySource_Enum>(const <UserRoleSummarySource_Enum>[
      _$userRoleSummarySourceEnum_DIRECT,
      _$userRoleSummarySourceEnum_ASSIGNMENT,
    ]);

Serializer<UserRoleSummarySource_Enum> _$userRoleSummarySourceEnumSerializer =
    _$UserRoleSummarySource_EnumSerializer();

class _$UserRoleSummarySource_EnumSerializer
    implements PrimitiveSerializer<UserRoleSummarySource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DIRECT': 'DIRECT',
    'ASSIGNMENT': 'ASSIGNMENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DIRECT': 'DIRECT',
    'ASSIGNMENT': 'ASSIGNMENT',
  };

  @override
  final Iterable<Type> types = const <Type>[UserRoleSummarySource_Enum];
  @override
  final String wireName = 'UserRoleSummarySource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    UserRoleSummarySource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserRoleSummarySource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserRoleSummarySource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserRoleSummary extends UserRoleSummary {
  @override
  final Role role;
  @override
  final String? branchId;
  @override
  final UserRoleSummaryBranch? branch;
  @override
  final UserRoleSummarySource_Enum source_;

  factory _$UserRoleSummary([void Function(UserRoleSummaryBuilder)? updates]) =>
      (UserRoleSummaryBuilder()..update(updates))._build();

  _$UserRoleSummary._({
    required this.role,
    this.branchId,
    this.branch,
    required this.source_,
  }) : super._();
  @override
  UserRoleSummary rebuild(void Function(UserRoleSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserRoleSummaryBuilder toBuilder() => UserRoleSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserRoleSummary &&
        role == other.role &&
        branchId == other.branchId &&
        branch == other.branch &&
        source_ == other.source_;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserRoleSummary')
          ..add('role', role)
          ..add('branchId', branchId)
          ..add('branch', branch)
          ..add('source_', source_))
        .toString();
  }
}

class UserRoleSummaryBuilder
    implements Builder<UserRoleSummary, UserRoleSummaryBuilder> {
  _$UserRoleSummary? _$v;

  Role? _role;
  Role? get role => _$this._role;
  set role(Role? role) => _$this._role = role;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  UserRoleSummaryBranchBuilder? _branch;
  UserRoleSummaryBranchBuilder get branch =>
      _$this._branch ??= UserRoleSummaryBranchBuilder();
  set branch(UserRoleSummaryBranchBuilder? branch) => _$this._branch = branch;

  UserRoleSummarySource_Enum? _source_;
  UserRoleSummarySource_Enum? get source_ => _$this._source_;
  set source_(UserRoleSummarySource_Enum? source_) => _$this._source_ = source_;

  UserRoleSummaryBuilder() {
    UserRoleSummary._defaults(this);
  }

  UserRoleSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _role = $v.role;
      _branchId = $v.branchId;
      _branch = $v.branch?.toBuilder();
      _source_ = $v.source_;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserRoleSummary other) {
    _$v = other as _$UserRoleSummary;
  }

  @override
  void update(void Function(UserRoleSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserRoleSummary build() => _build();

  _$UserRoleSummary _build() {
    _$UserRoleSummary _$result;
    try {
      _$result =
          _$v ??
          _$UserRoleSummary._(
            role: BuiltValueNullFieldError.checkNotNull(
              role,
              r'UserRoleSummary',
              'role',
            ),
            branchId: branchId,
            branch: _branch?.build(),
            source_: BuiltValueNullFieldError.checkNotNull(
              source_,
              r'UserRoleSummary',
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
          r'UserRoleSummary',
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
