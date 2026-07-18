// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'check_in_token_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CheckInTokenStatusPurposeEnum
_$checkInTokenStatusPurposeEnum_INSTRUCTOR_CHECK_IN =
    const CheckInTokenStatusPurposeEnum._('INSTRUCTOR_CHECK_IN');
const CheckInTokenStatusPurposeEnum
_$checkInTokenStatusPurposeEnum_CUSTOMER_CHECK_IN =
    const CheckInTokenStatusPurposeEnum._('CUSTOMER_CHECK_IN');

CheckInTokenStatusPurposeEnum _$checkInTokenStatusPurposeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'INSTRUCTOR_CHECK_IN':
      return _$checkInTokenStatusPurposeEnum_INSTRUCTOR_CHECK_IN;
    case 'CUSTOMER_CHECK_IN':
      return _$checkInTokenStatusPurposeEnum_CUSTOMER_CHECK_IN;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenStatusPurposeEnum>
_$checkInTokenStatusPurposeEnumValues = BuiltSet<CheckInTokenStatusPurposeEnum>(
  const <CheckInTokenStatusPurposeEnum>[
    _$checkInTokenStatusPurposeEnum_INSTRUCTOR_CHECK_IN,
    _$checkInTokenStatusPurposeEnum_CUSTOMER_CHECK_IN,
  ],
);

const CheckInTokenStatusResourceTypeEnum
_$checkInTokenStatusResourceTypeEnum_CLASS_SLOT =
    const CheckInTokenStatusResourceTypeEnum._('CLASS_SLOT');
const CheckInTokenStatusResourceTypeEnum
_$checkInTokenStatusResourceTypeEnum_BOOKING =
    const CheckInTokenStatusResourceTypeEnum._('BOOKING');

CheckInTokenStatusResourceTypeEnum _$checkInTokenStatusResourceTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CLASS_SLOT':
      return _$checkInTokenStatusResourceTypeEnum_CLASS_SLOT;
    case 'BOOKING':
      return _$checkInTokenStatusResourceTypeEnum_BOOKING;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenStatusResourceTypeEnum>
_$checkInTokenStatusResourceTypeEnumValues =
    BuiltSet<CheckInTokenStatusResourceTypeEnum>(
      const <CheckInTokenStatusResourceTypeEnum>[
        _$checkInTokenStatusResourceTypeEnum_CLASS_SLOT,
        _$checkInTokenStatusResourceTypeEnum_BOOKING,
      ],
    );

const CheckInTokenStatusStatusEnum _$checkInTokenStatusStatusEnum_ACTIVE =
    const CheckInTokenStatusStatusEnum._('ACTIVE');
const CheckInTokenStatusStatusEnum _$checkInTokenStatusStatusEnum_USED =
    const CheckInTokenStatusStatusEnum._('USED');
const CheckInTokenStatusStatusEnum _$checkInTokenStatusStatusEnum_REVOKED =
    const CheckInTokenStatusStatusEnum._('REVOKED');
const CheckInTokenStatusStatusEnum _$checkInTokenStatusStatusEnum_EXPIRED =
    const CheckInTokenStatusStatusEnum._('EXPIRED');

CheckInTokenStatusStatusEnum _$checkInTokenStatusStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$checkInTokenStatusStatusEnum_ACTIVE;
    case 'USED':
      return _$checkInTokenStatusStatusEnum_USED;
    case 'REVOKED':
      return _$checkInTokenStatusStatusEnum_REVOKED;
    case 'EXPIRED':
      return _$checkInTokenStatusStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenStatusStatusEnum>
_$checkInTokenStatusStatusEnumValues =
    BuiltSet<CheckInTokenStatusStatusEnum>(const <CheckInTokenStatusStatusEnum>[
      _$checkInTokenStatusStatusEnum_ACTIVE,
      _$checkInTokenStatusStatusEnum_USED,
      _$checkInTokenStatusStatusEnum_REVOKED,
      _$checkInTokenStatusStatusEnum_EXPIRED,
    ]);

Serializer<CheckInTokenStatusPurposeEnum>
_$checkInTokenStatusPurposeEnumSerializer =
    _$CheckInTokenStatusPurposeEnumSerializer();
Serializer<CheckInTokenStatusResourceTypeEnum>
_$checkInTokenStatusResourceTypeEnumSerializer =
    _$CheckInTokenStatusResourceTypeEnumSerializer();
Serializer<CheckInTokenStatusStatusEnum>
_$checkInTokenStatusStatusEnumSerializer =
    _$CheckInTokenStatusStatusEnumSerializer();

class _$CheckInTokenStatusPurposeEnumSerializer
    implements PrimitiveSerializer<CheckInTokenStatusPurposeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenStatusPurposeEnum];
  @override
  final String wireName = 'CheckInTokenStatusPurposeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenStatusPurposeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenStatusPurposeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenStatusPurposeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenStatusResourceTypeEnumSerializer
    implements PrimitiveSerializer<CheckInTokenStatusResourceTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CLASS_SLOT': 'CLASS_SLOT',
    'BOOKING': 'BOOKING',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CLASS_SLOT': 'CLASS_SLOT',
    'BOOKING': 'BOOKING',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenStatusResourceTypeEnum];
  @override
  final String wireName = 'CheckInTokenStatusResourceTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenStatusResourceTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenStatusResourceTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenStatusResourceTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenStatusStatusEnumSerializer
    implements PrimitiveSerializer<CheckInTokenStatusStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
    'EXPIRED': 'EXPIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
    'EXPIRED': 'EXPIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenStatusStatusEnum];
  @override
  final String wireName = 'CheckInTokenStatusStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenStatusStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenStatusStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenStatusStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenStatus extends CheckInTokenStatus {
  @override
  final String id;
  @override
  final CheckInTokenStatusPurposeEnum purpose;
  @override
  final CheckInTokenStatusResourceTypeEnum resourceType;
  @override
  final String resourceId;
  @override
  final DateTime expiresAt;
  @override
  final DateTime? usedAt;
  @override
  final DateTime? revokedAt;
  @override
  final CheckInTokenStatusStatusEnum status;

  factory _$CheckInTokenStatus([
    void Function(CheckInTokenStatusBuilder)? updates,
  ]) => (CheckInTokenStatusBuilder()..update(updates))._build();

  _$CheckInTokenStatus._({
    required this.id,
    required this.purpose,
    required this.resourceType,
    required this.resourceId,
    required this.expiresAt,
    this.usedAt,
    this.revokedAt,
    required this.status,
  }) : super._();
  @override
  CheckInTokenStatus rebuild(
    void Function(CheckInTokenStatusBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CheckInTokenStatusBuilder toBuilder() =>
      CheckInTokenStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckInTokenStatus &&
        id == other.id &&
        purpose == other.purpose &&
        resourceType == other.resourceType &&
        resourceId == other.resourceId &&
        expiresAt == other.expiresAt &&
        usedAt == other.usedAt &&
        revokedAt == other.revokedAt &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, resourceType.hashCode);
    _$hash = $jc(_$hash, resourceId.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, usedAt.hashCode);
    _$hash = $jc(_$hash, revokedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CheckInTokenStatus')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('resourceType', resourceType)
          ..add('resourceId', resourceId)
          ..add('expiresAt', expiresAt)
          ..add('usedAt', usedAt)
          ..add('revokedAt', revokedAt)
          ..add('status', status))
        .toString();
  }
}

class CheckInTokenStatusBuilder
    implements Builder<CheckInTokenStatus, CheckInTokenStatusBuilder> {
  _$CheckInTokenStatus? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  CheckInTokenStatusPurposeEnum? _purpose;
  CheckInTokenStatusPurposeEnum? get purpose => _$this._purpose;
  set purpose(CheckInTokenStatusPurposeEnum? purpose) =>
      _$this._purpose = purpose;

  CheckInTokenStatusResourceTypeEnum? _resourceType;
  CheckInTokenStatusResourceTypeEnum? get resourceType => _$this._resourceType;
  set resourceType(CheckInTokenStatusResourceTypeEnum? resourceType) =>
      _$this._resourceType = resourceType;

  String? _resourceId;
  String? get resourceId => _$this._resourceId;
  set resourceId(String? resourceId) => _$this._resourceId = resourceId;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  DateTime? _usedAt;
  DateTime? get usedAt => _$this._usedAt;
  set usedAt(DateTime? usedAt) => _$this._usedAt = usedAt;

  DateTime? _revokedAt;
  DateTime? get revokedAt => _$this._revokedAt;
  set revokedAt(DateTime? revokedAt) => _$this._revokedAt = revokedAt;

  CheckInTokenStatusStatusEnum? _status;
  CheckInTokenStatusStatusEnum? get status => _$this._status;
  set status(CheckInTokenStatusStatusEnum? status) => _$this._status = status;

  CheckInTokenStatusBuilder() {
    CheckInTokenStatus._defaults(this);
  }

  CheckInTokenStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _resourceType = $v.resourceType;
      _resourceId = $v.resourceId;
      _expiresAt = $v.expiresAt;
      _usedAt = $v.usedAt;
      _revokedAt = $v.revokedAt;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckInTokenStatus other) {
    _$v = other as _$CheckInTokenStatus;
  }

  @override
  void update(void Function(CheckInTokenStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckInTokenStatus build() => _build();

  _$CheckInTokenStatus _build() {
    final _$result =
        _$v ??
        _$CheckInTokenStatus._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CheckInTokenStatus',
            'id',
          ),
          purpose: BuiltValueNullFieldError.checkNotNull(
            purpose,
            r'CheckInTokenStatus',
            'purpose',
          ),
          resourceType: BuiltValueNullFieldError.checkNotNull(
            resourceType,
            r'CheckInTokenStatus',
            'resourceType',
          ),
          resourceId: BuiltValueNullFieldError.checkNotNull(
            resourceId,
            r'CheckInTokenStatus',
            'resourceId',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'CheckInTokenStatus',
            'expiresAt',
          ),
          usedAt: usedAt,
          revokedAt: revokedAt,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CheckInTokenStatus',
            'status',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
