// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_check_in_token_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerCheckInTokenStatusStatusEnum
_$customerCheckInTokenStatusStatusEnum_ACTIVE =
    const CustomerCheckInTokenStatusStatusEnum._('ACTIVE');
const CustomerCheckInTokenStatusStatusEnum
_$customerCheckInTokenStatusStatusEnum_USED =
    const CustomerCheckInTokenStatusStatusEnum._('USED');
const CustomerCheckInTokenStatusStatusEnum
_$customerCheckInTokenStatusStatusEnum_REVOKED =
    const CustomerCheckInTokenStatusStatusEnum._('REVOKED');
const CustomerCheckInTokenStatusStatusEnum
_$customerCheckInTokenStatusStatusEnum_EXPIRED =
    const CustomerCheckInTokenStatusStatusEnum._('EXPIRED');

CustomerCheckInTokenStatusStatusEnum
_$customerCheckInTokenStatusStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$customerCheckInTokenStatusStatusEnum_ACTIVE;
    case 'USED':
      return _$customerCheckInTokenStatusStatusEnum_USED;
    case 'REVOKED':
      return _$customerCheckInTokenStatusStatusEnum_REVOKED;
    case 'EXPIRED':
      return _$customerCheckInTokenStatusStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerCheckInTokenStatusStatusEnum>
_$customerCheckInTokenStatusStatusEnumValues =
    BuiltSet<CustomerCheckInTokenStatusStatusEnum>(
      const <CustomerCheckInTokenStatusStatusEnum>[
        _$customerCheckInTokenStatusStatusEnum_ACTIVE,
        _$customerCheckInTokenStatusStatusEnum_USED,
        _$customerCheckInTokenStatusStatusEnum_REVOKED,
        _$customerCheckInTokenStatusStatusEnum_EXPIRED,
      ],
    );

Serializer<CustomerCheckInTokenStatusStatusEnum>
_$customerCheckInTokenStatusStatusEnumSerializer =
    _$CustomerCheckInTokenStatusStatusEnumSerializer();

class _$CustomerCheckInTokenStatusStatusEnumSerializer
    implements PrimitiveSerializer<CustomerCheckInTokenStatusStatusEnum> {
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
  final Iterable<Type> types = const <Type>[
    CustomerCheckInTokenStatusStatusEnum,
  ];
  @override
  final String wireName = 'CustomerCheckInTokenStatusStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerCheckInTokenStatusStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerCheckInTokenStatusStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerCheckInTokenStatusStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerCheckInTokenStatus extends CustomerCheckInTokenStatus {
  @override
  final String id;
  @override
  final JsonObject? purpose;
  @override
  final JsonObject? resourceType;
  @override
  final String resourceId;
  @override
  final DateTime notBeforeAt;
  @override
  final DateTime expiresAt;
  @override
  final DateTime? usedAt;
  @override
  final DateTime? revokedAt;
  @override
  final CustomerCheckInTokenStatusStatusEnum status;
  @override
  final int version;
  @override
  final String customerName;
  @override
  final String className;
  @override
  final CheckInResultBranch branch;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;

  factory _$CustomerCheckInTokenStatus([
    void Function(CustomerCheckInTokenStatusBuilder)? updates,
  ]) => (CustomerCheckInTokenStatusBuilder()..update(updates))._build();

  _$CustomerCheckInTokenStatus._({
    required this.id,
    this.purpose,
    this.resourceType,
    required this.resourceId,
    required this.notBeforeAt,
    required this.expiresAt,
    this.usedAt,
    this.revokedAt,
    required this.status,
    required this.version,
    required this.customerName,
    required this.className,
    required this.branch,
    required this.startAt,
    required this.endAt,
  }) : super._();
  @override
  CustomerCheckInTokenStatus rebuild(
    void Function(CustomerCheckInTokenStatusBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerCheckInTokenStatusBuilder toBuilder() =>
      CustomerCheckInTokenStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerCheckInTokenStatus &&
        id == other.id &&
        purpose == other.purpose &&
        resourceType == other.resourceType &&
        resourceId == other.resourceId &&
        notBeforeAt == other.notBeforeAt &&
        expiresAt == other.expiresAt &&
        usedAt == other.usedAt &&
        revokedAt == other.revokedAt &&
        status == other.status &&
        version == other.version &&
        customerName == other.customerName &&
        className == other.className &&
        branch == other.branch &&
        startAt == other.startAt &&
        endAt == other.endAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, resourceType.hashCode);
    _$hash = $jc(_$hash, resourceId.hashCode);
    _$hash = $jc(_$hash, notBeforeAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, usedAt.hashCode);
    _$hash = $jc(_$hash, revokedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, customerName.hashCode);
    _$hash = $jc(_$hash, className.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerCheckInTokenStatus')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('resourceType', resourceType)
          ..add('resourceId', resourceId)
          ..add('notBeforeAt', notBeforeAt)
          ..add('expiresAt', expiresAt)
          ..add('usedAt', usedAt)
          ..add('revokedAt', revokedAt)
          ..add('status', status)
          ..add('version', version)
          ..add('customerName', customerName)
          ..add('className', className)
          ..add('branch', branch)
          ..add('startAt', startAt)
          ..add('endAt', endAt))
        .toString();
  }
}

class CustomerCheckInTokenStatusBuilder
    implements
        Builder<CustomerCheckInTokenStatus, CustomerCheckInTokenStatusBuilder> {
  _$CustomerCheckInTokenStatus? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  JsonObject? _purpose;
  JsonObject? get purpose => _$this._purpose;
  set purpose(JsonObject? purpose) => _$this._purpose = purpose;

  JsonObject? _resourceType;
  JsonObject? get resourceType => _$this._resourceType;
  set resourceType(JsonObject? resourceType) =>
      _$this._resourceType = resourceType;

  String? _resourceId;
  String? get resourceId => _$this._resourceId;
  set resourceId(String? resourceId) => _$this._resourceId = resourceId;

  DateTime? _notBeforeAt;
  DateTime? get notBeforeAt => _$this._notBeforeAt;
  set notBeforeAt(DateTime? notBeforeAt) => _$this._notBeforeAt = notBeforeAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  DateTime? _usedAt;
  DateTime? get usedAt => _$this._usedAt;
  set usedAt(DateTime? usedAt) => _$this._usedAt = usedAt;

  DateTime? _revokedAt;
  DateTime? get revokedAt => _$this._revokedAt;
  set revokedAt(DateTime? revokedAt) => _$this._revokedAt = revokedAt;

  CustomerCheckInTokenStatusStatusEnum? _status;
  CustomerCheckInTokenStatusStatusEnum? get status => _$this._status;
  set status(CustomerCheckInTokenStatusStatusEnum? status) =>
      _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  String? _customerName;
  String? get customerName => _$this._customerName;
  set customerName(String? customerName) => _$this._customerName = customerName;

  String? _className;
  String? get className => _$this._className;
  set className(String? className) => _$this._className = className;

  CheckInResultBranchBuilder? _branch;
  CheckInResultBranchBuilder get branch =>
      _$this._branch ??= CheckInResultBranchBuilder();
  set branch(CheckInResultBranchBuilder? branch) => _$this._branch = branch;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  CustomerCheckInTokenStatusBuilder() {
    CustomerCheckInTokenStatus._defaults(this);
  }

  CustomerCheckInTokenStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _resourceType = $v.resourceType;
      _resourceId = $v.resourceId;
      _notBeforeAt = $v.notBeforeAt;
      _expiresAt = $v.expiresAt;
      _usedAt = $v.usedAt;
      _revokedAt = $v.revokedAt;
      _status = $v.status;
      _version = $v.version;
      _customerName = $v.customerName;
      _className = $v.className;
      _branch = $v.branch.toBuilder();
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerCheckInTokenStatus other) {
    _$v = other as _$CustomerCheckInTokenStatus;
  }

  @override
  void update(void Function(CustomerCheckInTokenStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerCheckInTokenStatus build() => _build();

  _$CustomerCheckInTokenStatus _build() {
    _$CustomerCheckInTokenStatus _$result;
    try {
      _$result =
          _$v ??
          _$CustomerCheckInTokenStatus._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CustomerCheckInTokenStatus',
              'id',
            ),
            purpose: purpose,
            resourceType: resourceType,
            resourceId: BuiltValueNullFieldError.checkNotNull(
              resourceId,
              r'CustomerCheckInTokenStatus',
              'resourceId',
            ),
            notBeforeAt: BuiltValueNullFieldError.checkNotNull(
              notBeforeAt,
              r'CustomerCheckInTokenStatus',
              'notBeforeAt',
            ),
            expiresAt: BuiltValueNullFieldError.checkNotNull(
              expiresAt,
              r'CustomerCheckInTokenStatus',
              'expiresAt',
            ),
            usedAt: usedAt,
            revokedAt: revokedAt,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'CustomerCheckInTokenStatus',
              'status',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'CustomerCheckInTokenStatus',
              'version',
            ),
            customerName: BuiltValueNullFieldError.checkNotNull(
              customerName,
              r'CustomerCheckInTokenStatus',
              'customerName',
            ),
            className: BuiltValueNullFieldError.checkNotNull(
              className,
              r'CustomerCheckInTokenStatus',
              'className',
            ),
            branch: branch.build(),
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'CustomerCheckInTokenStatus',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'CustomerCheckInTokenStatus',
              'endAt',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        branch.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerCheckInTokenStatus',
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
