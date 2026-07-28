// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AssignmentAssignmentTypeEnum _$assignmentAssignmentTypeEnum_OWNER =
    const AssignmentAssignmentTypeEnum._('OWNER');
const AssignmentAssignmentTypeEnum _$assignmentAssignmentTypeEnum_INSTRUCTOR =
    const AssignmentAssignmentTypeEnum._('INSTRUCTOR');

AssignmentAssignmentTypeEnum _$assignmentAssignmentTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'OWNER':
      return _$assignmentAssignmentTypeEnum_OWNER;
    case 'INSTRUCTOR':
      return _$assignmentAssignmentTypeEnum_INSTRUCTOR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AssignmentAssignmentTypeEnum>
_$assignmentAssignmentTypeEnumValues = BuiltSet<AssignmentAssignmentTypeEnum>(
  const <AssignmentAssignmentTypeEnum>[
    _$assignmentAssignmentTypeEnum_OWNER,
    _$assignmentAssignmentTypeEnum_INSTRUCTOR,
  ],
);

const AssignmentStatusEnum _$assignmentStatusEnum_ACTIVE =
    const AssignmentStatusEnum._('ACTIVE');
const AssignmentStatusEnum _$assignmentStatusEnum_ENDED =
    const AssignmentStatusEnum._('ENDED');

AssignmentStatusEnum _$assignmentStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$assignmentStatusEnum_ACTIVE;
    case 'ENDED':
      return _$assignmentStatusEnum_ENDED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AssignmentStatusEnum> _$assignmentStatusEnumValues =
    BuiltSet<AssignmentStatusEnum>(const <AssignmentStatusEnum>[
      _$assignmentStatusEnum_ACTIVE,
      _$assignmentStatusEnum_ENDED,
    ]);

Serializer<AssignmentAssignmentTypeEnum>
_$assignmentAssignmentTypeEnumSerializer =
    _$AssignmentAssignmentTypeEnumSerializer();
Serializer<AssignmentStatusEnum> _$assignmentStatusEnumSerializer =
    _$AssignmentStatusEnumSerializer();

class _$AssignmentAssignmentTypeEnumSerializer
    implements PrimitiveSerializer<AssignmentAssignmentTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OWNER': 'OWNER',
    'INSTRUCTOR': 'INSTRUCTOR',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OWNER': 'OWNER',
    'INSTRUCTOR': 'INSTRUCTOR',
  };

  @override
  final Iterable<Type> types = const <Type>[AssignmentAssignmentTypeEnum];
  @override
  final String wireName = 'AssignmentAssignmentTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    AssignmentAssignmentTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AssignmentAssignmentTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AssignmentAssignmentTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AssignmentStatusEnumSerializer
    implements PrimitiveSerializer<AssignmentStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'ENDED': 'ENDED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'ENDED': 'ENDED',
  };

  @override
  final Iterable<Type> types = const <Type>[AssignmentStatusEnum];
  @override
  final String wireName = 'AssignmentStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    AssignmentStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AssignmentStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AssignmentStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Assignment extends Assignment {
  @override
  final String id;
  @override
  final String userId;
  @override
  final String branchId;
  @override
  final AssignmentAssignmentTypeEnum assignmentType;
  @override
  final Date activeFrom;
  @override
  final Date? activeUntil;
  @override
  final AssignmentStatusEnum status;
  @override
  final AssignmentManagementUser user;
  @override
  final AssignmentManagementBranch branch;
  @override
  final int version;

  factory _$Assignment([void Function(AssignmentBuilder)? updates]) =>
      (AssignmentBuilder()..update(updates))._build();

  _$Assignment._({
    required this.id,
    required this.userId,
    required this.branchId,
    required this.assignmentType,
    required this.activeFrom,
    this.activeUntil,
    required this.status,
    required this.user,
    required this.branch,
    required this.version,
  }) : super._();
  @override
  Assignment rebuild(void Function(AssignmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssignmentBuilder toBuilder() => AssignmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Assignment &&
        id == other.id &&
        userId == other.userId &&
        branchId == other.branchId &&
        assignmentType == other.assignmentType &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        status == other.status &&
        user == other.user &&
        branch == other.branch &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, userId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, assignmentType.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, user.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Assignment')
          ..add('id', id)
          ..add('userId', userId)
          ..add('branchId', branchId)
          ..add('assignmentType', assignmentType)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('status', status)
          ..add('user', user)
          ..add('branch', branch)
          ..add('version', version))
        .toString();
  }
}

class AssignmentBuilder implements Builder<Assignment, AssignmentBuilder> {
  _$Assignment? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _userId;
  String? get userId => _$this._userId;
  set userId(String? userId) => _$this._userId = userId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  AssignmentAssignmentTypeEnum? _assignmentType;
  AssignmentAssignmentTypeEnum? get assignmentType => _$this._assignmentType;
  set assignmentType(AssignmentAssignmentTypeEnum? assignmentType) =>
      _$this._assignmentType = assignmentType;

  Date? _activeFrom;
  Date? get activeFrom => _$this._activeFrom;
  set activeFrom(Date? activeFrom) => _$this._activeFrom = activeFrom;

  Date? _activeUntil;
  Date? get activeUntil => _$this._activeUntil;
  set activeUntil(Date? activeUntil) => _$this._activeUntil = activeUntil;

  AssignmentStatusEnum? _status;
  AssignmentStatusEnum? get status => _$this._status;
  set status(AssignmentStatusEnum? status) => _$this._status = status;

  AssignmentManagementUserBuilder? _user;
  AssignmentManagementUserBuilder get user =>
      _$this._user ??= AssignmentManagementUserBuilder();
  set user(AssignmentManagementUserBuilder? user) => _$this._user = user;

  AssignmentManagementBranchBuilder? _branch;
  AssignmentManagementBranchBuilder get branch =>
      _$this._branch ??= AssignmentManagementBranchBuilder();
  set branch(AssignmentManagementBranchBuilder? branch) =>
      _$this._branch = branch;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  AssignmentBuilder() {
    Assignment._defaults(this);
  }

  AssignmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _userId = $v.userId;
      _branchId = $v.branchId;
      _assignmentType = $v.assignmentType;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _status = $v.status;
      _user = $v.user.toBuilder();
      _branch = $v.branch.toBuilder();
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Assignment other) {
    _$v = other as _$Assignment;
  }

  @override
  void update(void Function(AssignmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Assignment build() => _build();

  _$Assignment _build() {
    _$Assignment _$result;
    try {
      _$result =
          _$v ??
          _$Assignment._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Assignment', 'id'),
            userId: BuiltValueNullFieldError.checkNotNull(
              userId,
              r'Assignment',
              'userId',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'Assignment',
              'branchId',
            ),
            assignmentType: BuiltValueNullFieldError.checkNotNull(
              assignmentType,
              r'Assignment',
              'assignmentType',
            ),
            activeFrom: BuiltValueNullFieldError.checkNotNull(
              activeFrom,
              r'Assignment',
              'activeFrom',
            ),
            activeUntil: activeUntil,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'Assignment',
              'status',
            ),
            user: user.build(),
            branch: branch.build(),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'Assignment',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'user';
        user.build();
        _$failedField = 'branch';
        branch.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'Assignment',
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
