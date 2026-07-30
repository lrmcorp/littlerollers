// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_log.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AuditLogActorTypeEnum _$auditLogActorTypeEnum_USER =
    const AuditLogActorTypeEnum._('USER');
const AuditLogActorTypeEnum _$auditLogActorTypeEnum_SYSTEM =
    const AuditLogActorTypeEnum._('SYSTEM');
const AuditLogActorTypeEnum _$auditLogActorTypeEnum_MIGRATION =
    const AuditLogActorTypeEnum._('MIGRATION');

AuditLogActorTypeEnum _$auditLogActorTypeEnumValueOf(String name) {
  switch (name) {
    case 'USER':
      return _$auditLogActorTypeEnum_USER;
    case 'SYSTEM':
      return _$auditLogActorTypeEnum_SYSTEM;
    case 'MIGRATION':
      return _$auditLogActorTypeEnum_MIGRATION;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AuditLogActorTypeEnum> _$auditLogActorTypeEnumValues =
    BuiltSet<AuditLogActorTypeEnum>(const <AuditLogActorTypeEnum>[
      _$auditLogActorTypeEnum_USER,
      _$auditLogActorTypeEnum_SYSTEM,
      _$auditLogActorTypeEnum_MIGRATION,
    ]);

Serializer<AuditLogActorTypeEnum> _$auditLogActorTypeEnumSerializer =
    _$AuditLogActorTypeEnumSerializer();

class _$AuditLogActorTypeEnumSerializer
    implements PrimitiveSerializer<AuditLogActorTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'USER': 'USER',
    'SYSTEM': 'SYSTEM',
    'MIGRATION': 'MIGRATION',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'USER': 'USER',
    'SYSTEM': 'SYSTEM',
    'MIGRATION': 'MIGRATION',
  };

  @override
  final Iterable<Type> types = const <Type>[AuditLogActorTypeEnum];
  @override
  final String wireName = 'AuditLogActorTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    AuditLogActorTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AuditLogActorTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AuditLogActorTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AuditLog extends AuditLog {
  @override
  final String id;
  @override
  final DateTime occurredAt;
  @override
  final AuditLogActorTypeEnum actorType;
  @override
  final String? actorId;
  @override
  final String? branchId;
  @override
  final String? targetUserId;
  @override
  final AuditActorProjection? actor;
  @override
  final AuditTargetProjection? target;
  @override
  final AuditBranchProjection? branch;
  @override
  final String action;
  @override
  final String objectType;
  @override
  final String objectId;
  @override
  final JsonObject? beforeMasked;
  @override
  final JsonObject? afterMasked;
  @override
  final String correlationId;

  factory _$AuditLog([void Function(AuditLogBuilder)? updates]) =>
      (AuditLogBuilder()..update(updates))._build();

  _$AuditLog._({
    required this.id,
    required this.occurredAt,
    required this.actorType,
    this.actorId,
    this.branchId,
    this.targetUserId,
    this.actor,
    this.target,
    this.branch,
    required this.action,
    required this.objectType,
    required this.objectId,
    this.beforeMasked,
    this.afterMasked,
    required this.correlationId,
  }) : super._();
  @override
  AuditLog rebuild(void Function(AuditLogBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuditLogBuilder toBuilder() => AuditLogBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditLog &&
        id == other.id &&
        occurredAt == other.occurredAt &&
        actorType == other.actorType &&
        actorId == other.actorId &&
        branchId == other.branchId &&
        targetUserId == other.targetUserId &&
        actor == other.actor &&
        target == other.target &&
        branch == other.branch &&
        action == other.action &&
        objectType == other.objectType &&
        objectId == other.objectId &&
        beforeMasked == other.beforeMasked &&
        afterMasked == other.afterMasked &&
        correlationId == other.correlationId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jc(_$hash, actorType.hashCode);
    _$hash = $jc(_$hash, actorId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, targetUserId.hashCode);
    _$hash = $jc(_$hash, actor.hashCode);
    _$hash = $jc(_$hash, target.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, objectType.hashCode);
    _$hash = $jc(_$hash, objectId.hashCode);
    _$hash = $jc(_$hash, beforeMasked.hashCode);
    _$hash = $jc(_$hash, afterMasked.hashCode);
    _$hash = $jc(_$hash, correlationId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuditLog')
          ..add('id', id)
          ..add('occurredAt', occurredAt)
          ..add('actorType', actorType)
          ..add('actorId', actorId)
          ..add('branchId', branchId)
          ..add('targetUserId', targetUserId)
          ..add('actor', actor)
          ..add('target', target)
          ..add('branch', branch)
          ..add('action', action)
          ..add('objectType', objectType)
          ..add('objectId', objectId)
          ..add('beforeMasked', beforeMasked)
          ..add('afterMasked', afterMasked)
          ..add('correlationId', correlationId))
        .toString();
  }
}

class AuditLogBuilder implements Builder<AuditLog, AuditLogBuilder> {
  _$AuditLog? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  AuditLogActorTypeEnum? _actorType;
  AuditLogActorTypeEnum? get actorType => _$this._actorType;
  set actorType(AuditLogActorTypeEnum? actorType) =>
      _$this._actorType = actorType;

  String? _actorId;
  String? get actorId => _$this._actorId;
  set actorId(String? actorId) => _$this._actorId = actorId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _targetUserId;
  String? get targetUserId => _$this._targetUserId;
  set targetUserId(String? targetUserId) => _$this._targetUserId = targetUserId;

  AuditActorProjectionBuilder? _actor;
  AuditActorProjectionBuilder get actor =>
      _$this._actor ??= AuditActorProjectionBuilder();
  set actor(AuditActorProjectionBuilder? actor) => _$this._actor = actor;

  AuditTargetProjectionBuilder? _target;
  AuditTargetProjectionBuilder get target =>
      _$this._target ??= AuditTargetProjectionBuilder();
  set target(AuditTargetProjectionBuilder? target) => _$this._target = target;

  AuditBranchProjectionBuilder? _branch;
  AuditBranchProjectionBuilder get branch =>
      _$this._branch ??= AuditBranchProjectionBuilder();
  set branch(AuditBranchProjectionBuilder? branch) => _$this._branch = branch;

  String? _action;
  String? get action => _$this._action;
  set action(String? action) => _$this._action = action;

  String? _objectType;
  String? get objectType => _$this._objectType;
  set objectType(String? objectType) => _$this._objectType = objectType;

  String? _objectId;
  String? get objectId => _$this._objectId;
  set objectId(String? objectId) => _$this._objectId = objectId;

  JsonObject? _beforeMasked;
  JsonObject? get beforeMasked => _$this._beforeMasked;
  set beforeMasked(JsonObject? beforeMasked) =>
      _$this._beforeMasked = beforeMasked;

  JsonObject? _afterMasked;
  JsonObject? get afterMasked => _$this._afterMasked;
  set afterMasked(JsonObject? afterMasked) => _$this._afterMasked = afterMasked;

  String? _correlationId;
  String? get correlationId => _$this._correlationId;
  set correlationId(String? correlationId) =>
      _$this._correlationId = correlationId;

  AuditLogBuilder() {
    AuditLog._defaults(this);
  }

  AuditLogBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _occurredAt = $v.occurredAt;
      _actorType = $v.actorType;
      _actorId = $v.actorId;
      _branchId = $v.branchId;
      _targetUserId = $v.targetUserId;
      _actor = $v.actor?.toBuilder();
      _target = $v.target?.toBuilder();
      _branch = $v.branch?.toBuilder();
      _action = $v.action;
      _objectType = $v.objectType;
      _objectId = $v.objectId;
      _beforeMasked = $v.beforeMasked;
      _afterMasked = $v.afterMasked;
      _correlationId = $v.correlationId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditLog other) {
    _$v = other as _$AuditLog;
  }

  @override
  void update(void Function(AuditLogBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditLog build() => _build();

  _$AuditLog _build() {
    _$AuditLog _$result;
    try {
      _$result =
          _$v ??
          _$AuditLog._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'AuditLog', 'id'),
            occurredAt: BuiltValueNullFieldError.checkNotNull(
              occurredAt,
              r'AuditLog',
              'occurredAt',
            ),
            actorType: BuiltValueNullFieldError.checkNotNull(
              actorType,
              r'AuditLog',
              'actorType',
            ),
            actorId: actorId,
            branchId: branchId,
            targetUserId: targetUserId,
            actor: _actor?.build(),
            target: _target?.build(),
            branch: _branch?.build(),
            action: BuiltValueNullFieldError.checkNotNull(
              action,
              r'AuditLog',
              'action',
            ),
            objectType: BuiltValueNullFieldError.checkNotNull(
              objectType,
              r'AuditLog',
              'objectType',
            ),
            objectId: BuiltValueNullFieldError.checkNotNull(
              objectId,
              r'AuditLog',
              'objectId',
            ),
            beforeMasked: beforeMasked,
            afterMasked: afterMasked,
            correlationId: BuiltValueNullFieldError.checkNotNull(
              correlationId,
              r'AuditLog',
              'correlationId',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'actor';
        _actor?.build();
        _$failedField = 'target';
        _target?.build();
        _$failedField = 'branch';
        _branch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AuditLog',
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
