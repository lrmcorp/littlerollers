// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_adjustment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SessionAdjustmentReasonCodeEnum
_$sessionAdjustmentReasonCodeEnum_MIGRATION_CORRECTION =
    const SessionAdjustmentReasonCodeEnum._('MIGRATION_CORRECTION');
const SessionAdjustmentReasonCodeEnum
_$sessionAdjustmentReasonCodeEnum_ATTENDANCE_CORRECTION =
    const SessionAdjustmentReasonCodeEnum._('ATTENDANCE_CORRECTION');
const SessionAdjustmentReasonCodeEnum
_$sessionAdjustmentReasonCodeEnum_PACKAGE_COMPENSATION =
    const SessionAdjustmentReasonCodeEnum._('PACKAGE_COMPENSATION');
const SessionAdjustmentReasonCodeEnum
_$sessionAdjustmentReasonCodeEnum_SUPPORT_RECONCILIATION =
    const SessionAdjustmentReasonCodeEnum._('SUPPORT_RECONCILIATION');

SessionAdjustmentReasonCodeEnum _$sessionAdjustmentReasonCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'MIGRATION_CORRECTION':
      return _$sessionAdjustmentReasonCodeEnum_MIGRATION_CORRECTION;
    case 'ATTENDANCE_CORRECTION':
      return _$sessionAdjustmentReasonCodeEnum_ATTENDANCE_CORRECTION;
    case 'PACKAGE_COMPENSATION':
      return _$sessionAdjustmentReasonCodeEnum_PACKAGE_COMPENSATION;
    case 'SUPPORT_RECONCILIATION':
      return _$sessionAdjustmentReasonCodeEnum_SUPPORT_RECONCILIATION;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAdjustmentReasonCodeEnum>
_$sessionAdjustmentReasonCodeEnumValues =
    BuiltSet<SessionAdjustmentReasonCodeEnum>(
      const <SessionAdjustmentReasonCodeEnum>[
        _$sessionAdjustmentReasonCodeEnum_MIGRATION_CORRECTION,
        _$sessionAdjustmentReasonCodeEnum_ATTENDANCE_CORRECTION,
        _$sessionAdjustmentReasonCodeEnum_PACKAGE_COMPENSATION,
        _$sessionAdjustmentReasonCodeEnum_SUPPORT_RECONCILIATION,
      ],
    );

const SessionAdjustmentDecisionCodeEnum
_$sessionAdjustmentDecisionCodeEnum_CORRECTION_VERIFIED =
    const SessionAdjustmentDecisionCodeEnum._('CORRECTION_VERIFIED');
const SessionAdjustmentDecisionCodeEnum
_$sessionAdjustmentDecisionCodeEnum_INVALID_EVIDENCE =
    const SessionAdjustmentDecisionCodeEnum._('INVALID_EVIDENCE');
const SessionAdjustmentDecisionCodeEnum
_$sessionAdjustmentDecisionCodeEnum_DUPLICATE_REQUEST =
    const SessionAdjustmentDecisionCodeEnum._('DUPLICATE_REQUEST');
const SessionAdjustmentDecisionCodeEnum
_$sessionAdjustmentDecisionCodeEnum_OUT_OF_SCOPE =
    const SessionAdjustmentDecisionCodeEnum._('OUT_OF_SCOPE');

SessionAdjustmentDecisionCodeEnum _$sessionAdjustmentDecisionCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CORRECTION_VERIFIED':
      return _$sessionAdjustmentDecisionCodeEnum_CORRECTION_VERIFIED;
    case 'INVALID_EVIDENCE':
      return _$sessionAdjustmentDecisionCodeEnum_INVALID_EVIDENCE;
    case 'DUPLICATE_REQUEST':
      return _$sessionAdjustmentDecisionCodeEnum_DUPLICATE_REQUEST;
    case 'OUT_OF_SCOPE':
      return _$sessionAdjustmentDecisionCodeEnum_OUT_OF_SCOPE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAdjustmentDecisionCodeEnum>
_$sessionAdjustmentDecisionCodeEnumValues =
    BuiltSet<SessionAdjustmentDecisionCodeEnum>(
      const <SessionAdjustmentDecisionCodeEnum>[
        _$sessionAdjustmentDecisionCodeEnum_CORRECTION_VERIFIED,
        _$sessionAdjustmentDecisionCodeEnum_INVALID_EVIDENCE,
        _$sessionAdjustmentDecisionCodeEnum_DUPLICATE_REQUEST,
        _$sessionAdjustmentDecisionCodeEnum_OUT_OF_SCOPE,
      ],
    );

const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_PENDING =
    const SessionAdjustmentStatusEnum._('PENDING');
const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_POSTED =
    const SessionAdjustmentStatusEnum._('POSTED');
const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_REJECTED =
    const SessionAdjustmentStatusEnum._('REJECTED');

SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$sessionAdjustmentStatusEnum_PENDING;
    case 'POSTED':
      return _$sessionAdjustmentStatusEnum_POSTED;
    case 'REJECTED':
      return _$sessionAdjustmentStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAdjustmentStatusEnum>
_$sessionAdjustmentStatusEnumValues =
    BuiltSet<SessionAdjustmentStatusEnum>(const <SessionAdjustmentStatusEnum>[
      _$sessionAdjustmentStatusEnum_PENDING,
      _$sessionAdjustmentStatusEnum_POSTED,
      _$sessionAdjustmentStatusEnum_REJECTED,
    ]);

Serializer<SessionAdjustmentReasonCodeEnum>
_$sessionAdjustmentReasonCodeEnumSerializer =
    _$SessionAdjustmentReasonCodeEnumSerializer();
Serializer<SessionAdjustmentDecisionCodeEnum>
_$sessionAdjustmentDecisionCodeEnumSerializer =
    _$SessionAdjustmentDecisionCodeEnumSerializer();
Serializer<SessionAdjustmentStatusEnum>
_$sessionAdjustmentStatusEnumSerializer =
    _$SessionAdjustmentStatusEnumSerializer();

class _$SessionAdjustmentReasonCodeEnumSerializer
    implements PrimitiveSerializer<SessionAdjustmentReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'MIGRATION_CORRECTION': 'MIGRATION_CORRECTION',
    'ATTENDANCE_CORRECTION': 'ATTENDANCE_CORRECTION',
    'PACKAGE_COMPENSATION': 'PACKAGE_COMPENSATION',
    'SUPPORT_RECONCILIATION': 'SUPPORT_RECONCILIATION',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'MIGRATION_CORRECTION': 'MIGRATION_CORRECTION',
    'ATTENDANCE_CORRECTION': 'ATTENDANCE_CORRECTION',
    'PACKAGE_COMPENSATION': 'PACKAGE_COMPENSATION',
    'SUPPORT_RECONCILIATION': 'SUPPORT_RECONCILIATION',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionAdjustmentReasonCodeEnum];
  @override
  final String wireName = 'SessionAdjustmentReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAdjustmentReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAdjustmentReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionAdjustmentDecisionCodeEnumSerializer
    implements PrimitiveSerializer<SessionAdjustmentDecisionCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CORRECTION_VERIFIED': 'CORRECTION_VERIFIED',
    'INVALID_EVIDENCE': 'INVALID_EVIDENCE',
    'DUPLICATE_REQUEST': 'DUPLICATE_REQUEST',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CORRECTION_VERIFIED': 'CORRECTION_VERIFIED',
    'INVALID_EVIDENCE': 'INVALID_EVIDENCE',
    'DUPLICATE_REQUEST': 'DUPLICATE_REQUEST',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionAdjustmentDecisionCodeEnum];
  @override
  final String wireName = 'SessionAdjustmentDecisionCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentDecisionCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAdjustmentDecisionCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAdjustmentDecisionCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionAdjustmentStatusEnumSerializer
    implements PrimitiveSerializer<SessionAdjustmentStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionAdjustmentStatusEnum];
  @override
  final String wireName = 'SessionAdjustmentStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAdjustmentStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAdjustmentStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionAdjustment extends SessionAdjustment {
  @override
  final String id;
  @override
  final String customerPackageId;
  @override
  final int quantity;
  @override
  final SessionAdjustmentReasonCodeEnum reasonCode;
  @override
  final String requestedById;
  @override
  final String? decidedById;
  @override
  final SessionAdjustmentDecisionCodeEnum? decisionCode;
  @override
  final SessionAdjustmentStatusEnum status;
  @override
  final int version;
  @override
  final DateTime createdAt;

  factory _$SessionAdjustment([
    void Function(SessionAdjustmentBuilder)? updates,
  ]) => (SessionAdjustmentBuilder()..update(updates))._build();

  _$SessionAdjustment._({
    required this.id,
    required this.customerPackageId,
    required this.quantity,
    required this.reasonCode,
    required this.requestedById,
    this.decidedById,
    this.decisionCode,
    required this.status,
    required this.version,
    required this.createdAt,
  }) : super._();
  @override
  SessionAdjustment rebuild(void Function(SessionAdjustmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionAdjustmentBuilder toBuilder() =>
      SessionAdjustmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionAdjustment &&
        id == other.id &&
        customerPackageId == other.customerPackageId &&
        quantity == other.quantity &&
        reasonCode == other.reasonCode &&
        requestedById == other.requestedById &&
        decidedById == other.decidedById &&
        decisionCode == other.decisionCode &&
        status == other.status &&
        version == other.version &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, requestedById.hashCode);
    _$hash = $jc(_$hash, decidedById.hashCode);
    _$hash = $jc(_$hash, decisionCode.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionAdjustment')
          ..add('id', id)
          ..add('customerPackageId', customerPackageId)
          ..add('quantity', quantity)
          ..add('reasonCode', reasonCode)
          ..add('requestedById', requestedById)
          ..add('decidedById', decidedById)
          ..add('decisionCode', decisionCode)
          ..add('status', status)
          ..add('version', version)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class SessionAdjustmentBuilder
    implements Builder<SessionAdjustment, SessionAdjustmentBuilder> {
  _$SessionAdjustment? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  SessionAdjustmentReasonCodeEnum? _reasonCode;
  SessionAdjustmentReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(SessionAdjustmentReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _requestedById;
  String? get requestedById => _$this._requestedById;
  set requestedById(String? requestedById) =>
      _$this._requestedById = requestedById;

  String? _decidedById;
  String? get decidedById => _$this._decidedById;
  set decidedById(String? decidedById) => _$this._decidedById = decidedById;

  SessionAdjustmentDecisionCodeEnum? _decisionCode;
  SessionAdjustmentDecisionCodeEnum? get decisionCode => _$this._decisionCode;
  set decisionCode(SessionAdjustmentDecisionCodeEnum? decisionCode) =>
      _$this._decisionCode = decisionCode;

  SessionAdjustmentStatusEnum? _status;
  SessionAdjustmentStatusEnum? get status => _$this._status;
  set status(SessionAdjustmentStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  SessionAdjustmentBuilder() {
    SessionAdjustment._defaults(this);
  }

  SessionAdjustmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _customerPackageId = $v.customerPackageId;
      _quantity = $v.quantity;
      _reasonCode = $v.reasonCode;
      _requestedById = $v.requestedById;
      _decidedById = $v.decidedById;
      _decisionCode = $v.decisionCode;
      _status = $v.status;
      _version = $v.version;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionAdjustment other) {
    _$v = other as _$SessionAdjustment;
  }

  @override
  void update(void Function(SessionAdjustmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionAdjustment build() => _build();

  _$SessionAdjustment _build() {
    final _$result =
        _$v ??
        _$SessionAdjustment._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'SessionAdjustment',
            'id',
          ),
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'SessionAdjustment',
            'customerPackageId',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'SessionAdjustment',
            'quantity',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'SessionAdjustment',
            'reasonCode',
          ),
          requestedById: BuiltValueNullFieldError.checkNotNull(
            requestedById,
            r'SessionAdjustment',
            'requestedById',
          ),
          decidedById: decidedById,
          decisionCode: decisionCode,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'SessionAdjustment',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'SessionAdjustment',
            'version',
          ),
          createdAt: BuiltValueNullFieldError.checkNotNull(
            createdAt,
            r'SessionAdjustment',
            'createdAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
