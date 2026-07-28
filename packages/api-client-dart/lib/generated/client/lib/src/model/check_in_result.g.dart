// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'check_in_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CheckInResultPurposeEnum _$checkInResultPurposeEnum_INSTRUCTOR_CHECK_IN =
    const CheckInResultPurposeEnum._('INSTRUCTOR_CHECK_IN');
const CheckInResultPurposeEnum _$checkInResultPurposeEnum_CUSTOMER_CHECK_IN =
    const CheckInResultPurposeEnum._('CUSTOMER_CHECK_IN');
const CheckInResultPurposeEnum _$checkInResultPurposeEnum_CUSTOMER_BACKFILL =
    const CheckInResultPurposeEnum._('CUSTOMER_BACKFILL');

CheckInResultPurposeEnum _$checkInResultPurposeEnumValueOf(String name) {
  switch (name) {
    case 'INSTRUCTOR_CHECK_IN':
      return _$checkInResultPurposeEnum_INSTRUCTOR_CHECK_IN;
    case 'CUSTOMER_CHECK_IN':
      return _$checkInResultPurposeEnum_CUSTOMER_CHECK_IN;
    case 'CUSTOMER_BACKFILL':
      return _$checkInResultPurposeEnum_CUSTOMER_BACKFILL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInResultPurposeEnum> _$checkInResultPurposeEnumValues =
    BuiltSet<CheckInResultPurposeEnum>(const <CheckInResultPurposeEnum>[
      _$checkInResultPurposeEnum_INSTRUCTOR_CHECK_IN,
      _$checkInResultPurposeEnum_CUSTOMER_CHECK_IN,
      _$checkInResultPurposeEnum_CUSTOMER_BACKFILL,
    ]);

Serializer<CheckInResultPurposeEnum> _$checkInResultPurposeEnumSerializer =
    _$CheckInResultPurposeEnumSerializer();

class _$CheckInResultPurposeEnumSerializer
    implements PrimitiveSerializer<CheckInResultPurposeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
    'CUSTOMER_BACKFILL': 'CUSTOMER_BACKFILL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
    'CUSTOMER_BACKFILL': 'CUSTOMER_BACKFILL',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInResultPurposeEnum];
  @override
  final String wireName = 'CheckInResultPurposeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInResultPurposeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInResultPurposeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInResultPurposeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInResult extends CheckInResult {
  @override
  final String id;
  @override
  final CheckInResultPurposeEnum purpose;
  @override
  final String resourceId;
  @override
  final JsonObject? status;
  @override
  final DateTime checkedInAt;
  @override
  final String auditLogId;
  @override
  final String auditReference;
  @override
  final bool idempotentReplay;
  @override
  final String? customerName;
  @override
  final String? className;
  @override
  final CheckInResultBranch? branch;
  @override
  final DateTime? startAt;
  @override
  final DateTime? endAt;

  factory _$CheckInResult([void Function(CheckInResultBuilder)? updates]) =>
      (CheckInResultBuilder()..update(updates))._build();

  _$CheckInResult._({
    required this.id,
    required this.purpose,
    required this.resourceId,
    this.status,
    required this.checkedInAt,
    required this.auditLogId,
    required this.auditReference,
    required this.idempotentReplay,
    this.customerName,
    this.className,
    this.branch,
    this.startAt,
    this.endAt,
  }) : super._();
  @override
  CheckInResult rebuild(void Function(CheckInResultBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CheckInResultBuilder toBuilder() => CheckInResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckInResult &&
        id == other.id &&
        purpose == other.purpose &&
        resourceId == other.resourceId &&
        status == other.status &&
        checkedInAt == other.checkedInAt &&
        auditLogId == other.auditLogId &&
        auditReference == other.auditReference &&
        idempotentReplay == other.idempotentReplay &&
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
    _$hash = $jc(_$hash, resourceId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, checkedInAt.hashCode);
    _$hash = $jc(_$hash, auditLogId.hashCode);
    _$hash = $jc(_$hash, auditReference.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
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
    return (newBuiltValueToStringHelper(r'CheckInResult')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('resourceId', resourceId)
          ..add('status', status)
          ..add('checkedInAt', checkedInAt)
          ..add('auditLogId', auditLogId)
          ..add('auditReference', auditReference)
          ..add('idempotentReplay', idempotentReplay)
          ..add('customerName', customerName)
          ..add('className', className)
          ..add('branch', branch)
          ..add('startAt', startAt)
          ..add('endAt', endAt))
        .toString();
  }
}

class CheckInResultBuilder
    implements Builder<CheckInResult, CheckInResultBuilder> {
  _$CheckInResult? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  CheckInResultPurposeEnum? _purpose;
  CheckInResultPurposeEnum? get purpose => _$this._purpose;
  set purpose(CheckInResultPurposeEnum? purpose) => _$this._purpose = purpose;

  String? _resourceId;
  String? get resourceId => _$this._resourceId;
  set resourceId(String? resourceId) => _$this._resourceId = resourceId;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  DateTime? _checkedInAt;
  DateTime? get checkedInAt => _$this._checkedInAt;
  set checkedInAt(DateTime? checkedInAt) => _$this._checkedInAt = checkedInAt;

  String? _auditLogId;
  String? get auditLogId => _$this._auditLogId;
  set auditLogId(String? auditLogId) => _$this._auditLogId = auditLogId;

  String? _auditReference;
  String? get auditReference => _$this._auditReference;
  set auditReference(String? auditReference) =>
      _$this._auditReference = auditReference;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

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

  CheckInResultBuilder() {
    CheckInResult._defaults(this);
  }

  CheckInResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _resourceId = $v.resourceId;
      _status = $v.status;
      _checkedInAt = $v.checkedInAt;
      _auditLogId = $v.auditLogId;
      _auditReference = $v.auditReference;
      _idempotentReplay = $v.idempotentReplay;
      _customerName = $v.customerName;
      _className = $v.className;
      _branch = $v.branch?.toBuilder();
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckInResult other) {
    _$v = other as _$CheckInResult;
  }

  @override
  void update(void Function(CheckInResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckInResult build() => _build();

  _$CheckInResult _build() {
    _$CheckInResult _$result;
    try {
      _$result =
          _$v ??
          _$CheckInResult._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CheckInResult',
              'id',
            ),
            purpose: BuiltValueNullFieldError.checkNotNull(
              purpose,
              r'CheckInResult',
              'purpose',
            ),
            resourceId: BuiltValueNullFieldError.checkNotNull(
              resourceId,
              r'CheckInResult',
              'resourceId',
            ),
            status: status,
            checkedInAt: BuiltValueNullFieldError.checkNotNull(
              checkedInAt,
              r'CheckInResult',
              'checkedInAt',
            ),
            auditLogId: BuiltValueNullFieldError.checkNotNull(
              auditLogId,
              r'CheckInResult',
              'auditLogId',
            ),
            auditReference: BuiltValueNullFieldError.checkNotNull(
              auditReference,
              r'CheckInResult',
              'auditReference',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'CheckInResult',
              'idempotentReplay',
            ),
            customerName: customerName,
            className: className,
            branch: _branch?.build(),
            startAt: startAt,
            endAt: endAt,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        _branch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CheckInResult',
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
