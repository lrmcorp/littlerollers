// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AssignmentCommandAssignmentTypeEnum
_$assignmentCommandAssignmentTypeEnum_OWNER =
    const AssignmentCommandAssignmentTypeEnum._('OWNER');
const AssignmentCommandAssignmentTypeEnum
_$assignmentCommandAssignmentTypeEnum_INSTRUCTOR =
    const AssignmentCommandAssignmentTypeEnum._('INSTRUCTOR');

AssignmentCommandAssignmentTypeEnum
_$assignmentCommandAssignmentTypeEnumValueOf(String name) {
  switch (name) {
    case 'OWNER':
      return _$assignmentCommandAssignmentTypeEnum_OWNER;
    case 'INSTRUCTOR':
      return _$assignmentCommandAssignmentTypeEnum_INSTRUCTOR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AssignmentCommandAssignmentTypeEnum>
_$assignmentCommandAssignmentTypeEnumValues =
    BuiltSet<AssignmentCommandAssignmentTypeEnum>(
      const <AssignmentCommandAssignmentTypeEnum>[
        _$assignmentCommandAssignmentTypeEnum_OWNER,
        _$assignmentCommandAssignmentTypeEnum_INSTRUCTOR,
      ],
    );

Serializer<AssignmentCommandAssignmentTypeEnum>
_$assignmentCommandAssignmentTypeEnumSerializer =
    _$AssignmentCommandAssignmentTypeEnumSerializer();

class _$AssignmentCommandAssignmentTypeEnumSerializer
    implements PrimitiveSerializer<AssignmentCommandAssignmentTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OWNER': 'OWNER',
    'INSTRUCTOR': 'INSTRUCTOR',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OWNER': 'OWNER',
    'INSTRUCTOR': 'INSTRUCTOR',
  };

  @override
  final Iterable<Type> types = const <Type>[
    AssignmentCommandAssignmentTypeEnum,
  ];
  @override
  final String wireName = 'AssignmentCommandAssignmentTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    AssignmentCommandAssignmentTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AssignmentCommandAssignmentTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AssignmentCommandAssignmentTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AssignmentCommand extends AssignmentCommand {
  @override
  final String userId;
  @override
  final String branchId;
  @override
  final AssignmentCommandAssignmentTypeEnum assignmentType;
  @override
  final Date activeFrom;
  @override
  final Date? activeUntil;
  @override
  final String? reason;

  factory _$AssignmentCommand([
    void Function(AssignmentCommandBuilder)? updates,
  ]) => (AssignmentCommandBuilder()..update(updates))._build();

  _$AssignmentCommand._({
    required this.userId,
    required this.branchId,
    required this.assignmentType,
    required this.activeFrom,
    this.activeUntil,
    this.reason,
  }) : super._();
  @override
  AssignmentCommand rebuild(void Function(AssignmentCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssignmentCommandBuilder toBuilder() =>
      AssignmentCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentCommand &&
        userId == other.userId &&
        branchId == other.branchId &&
        assignmentType == other.assignmentType &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, userId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, assignmentType.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssignmentCommand')
          ..add('userId', userId)
          ..add('branchId', branchId)
          ..add('assignmentType', assignmentType)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('reason', reason))
        .toString();
  }
}

class AssignmentCommandBuilder
    implements Builder<AssignmentCommand, AssignmentCommandBuilder> {
  _$AssignmentCommand? _$v;

  String? _userId;
  String? get userId => _$this._userId;
  set userId(String? userId) => _$this._userId = userId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  AssignmentCommandAssignmentTypeEnum? _assignmentType;
  AssignmentCommandAssignmentTypeEnum? get assignmentType =>
      _$this._assignmentType;
  set assignmentType(AssignmentCommandAssignmentTypeEnum? assignmentType) =>
      _$this._assignmentType = assignmentType;

  Date? _activeFrom;
  Date? get activeFrom => _$this._activeFrom;
  set activeFrom(Date? activeFrom) => _$this._activeFrom = activeFrom;

  Date? _activeUntil;
  Date? get activeUntil => _$this._activeUntil;
  set activeUntil(Date? activeUntil) => _$this._activeUntil = activeUntil;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  AssignmentCommandBuilder() {
    AssignmentCommand._defaults(this);
  }

  AssignmentCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _userId = $v.userId;
      _branchId = $v.branchId;
      _assignmentType = $v.assignmentType;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignmentCommand other) {
    _$v = other as _$AssignmentCommand;
  }

  @override
  void update(void Function(AssignmentCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentCommand build() => _build();

  _$AssignmentCommand _build() {
    final _$result =
        _$v ??
        _$AssignmentCommand._(
          userId: BuiltValueNullFieldError.checkNotNull(
            userId,
            r'AssignmentCommand',
            'userId',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'AssignmentCommand',
            'branchId',
          ),
          assignmentType: BuiltValueNullFieldError.checkNotNull(
            assignmentType,
            r'AssignmentCommand',
            'assignmentType',
          ),
          activeFrom: BuiltValueNullFieldError.checkNotNull(
            activeFrom,
            r'AssignmentCommand',
            'activeFrom',
          ),
          activeUntil: activeUntil,
          reason: reason,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
