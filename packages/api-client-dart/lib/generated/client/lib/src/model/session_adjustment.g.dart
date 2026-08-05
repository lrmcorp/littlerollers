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
  final AdjustmentActor? requestedBy;
  @override
  final String? decidedById;
  @override
  final AdjustmentActor? decidedBy;
  @override
  final SessionAdjustmentDecisionCodeEnum? decisionCode;
  @override
  final String? decisionNote;
  @override
  final SessionAdjustmentStatusEnum status;
  @override
  final int? ledgerBalanceAtRequest;
  @override
  final int? reservedAtRequest;
  @override
  final AdjustmentCustomer? customer;
  @override
  final AdjustmentNamedReference? branch;
  @override
  final AdjustmentNamedReference? package;
  @override
  final AdjustmentNamedReference? classType;
  @override
  final int? currentBalance;
  @override
  final int? currentReserved;
  @override
  final int? currentAvailable;
  @override
  final int? projectedLedgerBalance;
  @override
  final int? projectedAvailable;
  @override
  final bool? eligibleForApproval;
  @override
  final String? eligibilityReason;
  @override
  final String? ledgerEntryId;
  @override
  final String? auditReference;
  @override
  final int version;
  @override
  final DateTime createdAt;
  @override
  final DateTime? decidedAt;

  factory _$SessionAdjustment([
    void Function(SessionAdjustmentBuilder)? updates,
  ]) => (SessionAdjustmentBuilder()..update(updates))._build();

  _$SessionAdjustment._({
    required this.id,
    required this.customerPackageId,
    required this.quantity,
    required this.reasonCode,
    required this.requestedById,
    this.requestedBy,
    this.decidedById,
    this.decidedBy,
    this.decisionCode,
    this.decisionNote,
    required this.status,
    this.ledgerBalanceAtRequest,
    this.reservedAtRequest,
    this.customer,
    this.branch,
    this.package,
    this.classType,
    this.currentBalance,
    this.currentReserved,
    this.currentAvailable,
    this.projectedLedgerBalance,
    this.projectedAvailable,
    this.eligibleForApproval,
    this.eligibilityReason,
    this.ledgerEntryId,
    this.auditReference,
    required this.version,
    required this.createdAt,
    this.decidedAt,
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
        requestedBy == other.requestedBy &&
        decidedById == other.decidedById &&
        decidedBy == other.decidedBy &&
        decisionCode == other.decisionCode &&
        decisionNote == other.decisionNote &&
        status == other.status &&
        ledgerBalanceAtRequest == other.ledgerBalanceAtRequest &&
        reservedAtRequest == other.reservedAtRequest &&
        customer == other.customer &&
        branch == other.branch &&
        package == other.package &&
        classType == other.classType &&
        currentBalance == other.currentBalance &&
        currentReserved == other.currentReserved &&
        currentAvailable == other.currentAvailable &&
        projectedLedgerBalance == other.projectedLedgerBalance &&
        projectedAvailable == other.projectedAvailable &&
        eligibleForApproval == other.eligibleForApproval &&
        eligibilityReason == other.eligibilityReason &&
        ledgerEntryId == other.ledgerEntryId &&
        auditReference == other.auditReference &&
        version == other.version &&
        createdAt == other.createdAt &&
        decidedAt == other.decidedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, requestedById.hashCode);
    _$hash = $jc(_$hash, requestedBy.hashCode);
    _$hash = $jc(_$hash, decidedById.hashCode);
    _$hash = $jc(_$hash, decidedBy.hashCode);
    _$hash = $jc(_$hash, decisionCode.hashCode);
    _$hash = $jc(_$hash, decisionNote.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, ledgerBalanceAtRequest.hashCode);
    _$hash = $jc(_$hash, reservedAtRequest.hashCode);
    _$hash = $jc(_$hash, customer.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, package.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jc(_$hash, currentBalance.hashCode);
    _$hash = $jc(_$hash, currentReserved.hashCode);
    _$hash = $jc(_$hash, currentAvailable.hashCode);
    _$hash = $jc(_$hash, projectedLedgerBalance.hashCode);
    _$hash = $jc(_$hash, projectedAvailable.hashCode);
    _$hash = $jc(_$hash, eligibleForApproval.hashCode);
    _$hash = $jc(_$hash, eligibilityReason.hashCode);
    _$hash = $jc(_$hash, ledgerEntryId.hashCode);
    _$hash = $jc(_$hash, auditReference.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
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
          ..add('requestedBy', requestedBy)
          ..add('decidedById', decidedById)
          ..add('decidedBy', decidedBy)
          ..add('decisionCode', decisionCode)
          ..add('decisionNote', decisionNote)
          ..add('status', status)
          ..add('ledgerBalanceAtRequest', ledgerBalanceAtRequest)
          ..add('reservedAtRequest', reservedAtRequest)
          ..add('customer', customer)
          ..add('branch', branch)
          ..add('package', package)
          ..add('classType', classType)
          ..add('currentBalance', currentBalance)
          ..add('currentReserved', currentReserved)
          ..add('currentAvailable', currentAvailable)
          ..add('projectedLedgerBalance', projectedLedgerBalance)
          ..add('projectedAvailable', projectedAvailable)
          ..add('eligibleForApproval', eligibleForApproval)
          ..add('eligibilityReason', eligibilityReason)
          ..add('ledgerEntryId', ledgerEntryId)
          ..add('auditReference', auditReference)
          ..add('version', version)
          ..add('createdAt', createdAt)
          ..add('decidedAt', decidedAt))
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

  AdjustmentActorBuilder? _requestedBy;
  AdjustmentActorBuilder get requestedBy =>
      _$this._requestedBy ??= AdjustmentActorBuilder();
  set requestedBy(AdjustmentActorBuilder? requestedBy) =>
      _$this._requestedBy = requestedBy;

  String? _decidedById;
  String? get decidedById => _$this._decidedById;
  set decidedById(String? decidedById) => _$this._decidedById = decidedById;

  AdjustmentActorBuilder? _decidedBy;
  AdjustmentActorBuilder get decidedBy =>
      _$this._decidedBy ??= AdjustmentActorBuilder();
  set decidedBy(AdjustmentActorBuilder? decidedBy) =>
      _$this._decidedBy = decidedBy;

  SessionAdjustmentDecisionCodeEnum? _decisionCode;
  SessionAdjustmentDecisionCodeEnum? get decisionCode => _$this._decisionCode;
  set decisionCode(SessionAdjustmentDecisionCodeEnum? decisionCode) =>
      _$this._decisionCode = decisionCode;

  String? _decisionNote;
  String? get decisionNote => _$this._decisionNote;
  set decisionNote(String? decisionNote) => _$this._decisionNote = decisionNote;

  SessionAdjustmentStatusEnum? _status;
  SessionAdjustmentStatusEnum? get status => _$this._status;
  set status(SessionAdjustmentStatusEnum? status) => _$this._status = status;

  int? _ledgerBalanceAtRequest;
  int? get ledgerBalanceAtRequest => _$this._ledgerBalanceAtRequest;
  set ledgerBalanceAtRequest(int? ledgerBalanceAtRequest) =>
      _$this._ledgerBalanceAtRequest = ledgerBalanceAtRequest;

  int? _reservedAtRequest;
  int? get reservedAtRequest => _$this._reservedAtRequest;
  set reservedAtRequest(int? reservedAtRequest) =>
      _$this._reservedAtRequest = reservedAtRequest;

  AdjustmentCustomerBuilder? _customer;
  AdjustmentCustomerBuilder get customer =>
      _$this._customer ??= AdjustmentCustomerBuilder();
  set customer(AdjustmentCustomerBuilder? customer) =>
      _$this._customer = customer;

  AdjustmentNamedReferenceBuilder? _branch;
  AdjustmentNamedReferenceBuilder get branch =>
      _$this._branch ??= AdjustmentNamedReferenceBuilder();
  set branch(AdjustmentNamedReferenceBuilder? branch) =>
      _$this._branch = branch;

  AdjustmentNamedReferenceBuilder? _package;
  AdjustmentNamedReferenceBuilder get package =>
      _$this._package ??= AdjustmentNamedReferenceBuilder();
  set package(AdjustmentNamedReferenceBuilder? package) =>
      _$this._package = package;

  AdjustmentNamedReferenceBuilder? _classType;
  AdjustmentNamedReferenceBuilder get classType =>
      _$this._classType ??= AdjustmentNamedReferenceBuilder();
  set classType(AdjustmentNamedReferenceBuilder? classType) =>
      _$this._classType = classType;

  int? _currentBalance;
  int? get currentBalance => _$this._currentBalance;
  set currentBalance(int? currentBalance) =>
      _$this._currentBalance = currentBalance;

  int? _currentReserved;
  int? get currentReserved => _$this._currentReserved;
  set currentReserved(int? currentReserved) =>
      _$this._currentReserved = currentReserved;

  int? _currentAvailable;
  int? get currentAvailable => _$this._currentAvailable;
  set currentAvailable(int? currentAvailable) =>
      _$this._currentAvailable = currentAvailable;

  int? _projectedLedgerBalance;
  int? get projectedLedgerBalance => _$this._projectedLedgerBalance;
  set projectedLedgerBalance(int? projectedLedgerBalance) =>
      _$this._projectedLedgerBalance = projectedLedgerBalance;

  int? _projectedAvailable;
  int? get projectedAvailable => _$this._projectedAvailable;
  set projectedAvailable(int? projectedAvailable) =>
      _$this._projectedAvailable = projectedAvailable;

  bool? _eligibleForApproval;
  bool? get eligibleForApproval => _$this._eligibleForApproval;
  set eligibleForApproval(bool? eligibleForApproval) =>
      _$this._eligibleForApproval = eligibleForApproval;

  String? _eligibilityReason;
  String? get eligibilityReason => _$this._eligibilityReason;
  set eligibilityReason(String? eligibilityReason) =>
      _$this._eligibilityReason = eligibilityReason;

  String? _ledgerEntryId;
  String? get ledgerEntryId => _$this._ledgerEntryId;
  set ledgerEntryId(String? ledgerEntryId) =>
      _$this._ledgerEntryId = ledgerEntryId;

  String? _auditReference;
  String? get auditReference => _$this._auditReference;
  set auditReference(String? auditReference) =>
      _$this._auditReference = auditReference;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

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
      _requestedBy = $v.requestedBy?.toBuilder();
      _decidedById = $v.decidedById;
      _decidedBy = $v.decidedBy?.toBuilder();
      _decisionCode = $v.decisionCode;
      _decisionNote = $v.decisionNote;
      _status = $v.status;
      _ledgerBalanceAtRequest = $v.ledgerBalanceAtRequest;
      _reservedAtRequest = $v.reservedAtRequest;
      _customer = $v.customer?.toBuilder();
      _branch = $v.branch?.toBuilder();
      _package = $v.package?.toBuilder();
      _classType = $v.classType?.toBuilder();
      _currentBalance = $v.currentBalance;
      _currentReserved = $v.currentReserved;
      _currentAvailable = $v.currentAvailable;
      _projectedLedgerBalance = $v.projectedLedgerBalance;
      _projectedAvailable = $v.projectedAvailable;
      _eligibleForApproval = $v.eligibleForApproval;
      _eligibilityReason = $v.eligibilityReason;
      _ledgerEntryId = $v.ledgerEntryId;
      _auditReference = $v.auditReference;
      _version = $v.version;
      _createdAt = $v.createdAt;
      _decidedAt = $v.decidedAt;
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
    _$SessionAdjustment _$result;
    try {
      _$result =
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
            requestedBy: _requestedBy?.build(),
            decidedById: decidedById,
            decidedBy: _decidedBy?.build(),
            decisionCode: decisionCode,
            decisionNote: decisionNote,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'SessionAdjustment',
              'status',
            ),
            ledgerBalanceAtRequest: ledgerBalanceAtRequest,
            reservedAtRequest: reservedAtRequest,
            customer: _customer?.build(),
            branch: _branch?.build(),
            package: _package?.build(),
            classType: _classType?.build(),
            currentBalance: currentBalance,
            currentReserved: currentReserved,
            currentAvailable: currentAvailable,
            projectedLedgerBalance: projectedLedgerBalance,
            projectedAvailable: projectedAvailable,
            eligibleForApproval: eligibleForApproval,
            eligibilityReason: eligibilityReason,
            ledgerEntryId: ledgerEntryId,
            auditReference: auditReference,
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
            decidedAt: decidedAt,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'requestedBy';
        _requestedBy?.build();

        _$failedField = 'decidedBy';
        _decidedBy?.build();

        _$failedField = 'customer';
        _customer?.build();
        _$failedField = 'branch';
        _branch?.build();
        _$failedField = 'package';
        _package?.build();
        _$failedField = 'classType';
        _classType?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'SessionAdjustment',
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
