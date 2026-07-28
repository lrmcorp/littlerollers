// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'purchase.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PurchaseStatusEnum _$purchaseStatusEnum_AWAITING_PAYMENT =
    const PurchaseStatusEnum._('AWAITING_PAYMENT');
const PurchaseStatusEnum _$purchaseStatusEnum_PENDING =
    const PurchaseStatusEnum._('PENDING');
const PurchaseStatusEnum _$purchaseStatusEnum_ACTION_REQUIRED =
    const PurchaseStatusEnum._('ACTION_REQUIRED');
const PurchaseStatusEnum _$purchaseStatusEnum_APPROVED =
    const PurchaseStatusEnum._('APPROVED');
const PurchaseStatusEnum _$purchaseStatusEnum_REJECTED =
    const PurchaseStatusEnum._('REJECTED');
const PurchaseStatusEnum _$purchaseStatusEnum_EXPIRED =
    const PurchaseStatusEnum._('EXPIRED');

PurchaseStatusEnum _$purchaseStatusEnumValueOf(String name) {
  switch (name) {
    case 'AWAITING_PAYMENT':
      return _$purchaseStatusEnum_AWAITING_PAYMENT;
    case 'PENDING':
      return _$purchaseStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$purchaseStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$purchaseStatusEnum_APPROVED;
    case 'REJECTED':
      return _$purchaseStatusEnum_REJECTED;
    case 'EXPIRED':
      return _$purchaseStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PurchaseStatusEnum> _$purchaseStatusEnumValues =
    BuiltSet<PurchaseStatusEnum>(const <PurchaseStatusEnum>[
      _$purchaseStatusEnum_AWAITING_PAYMENT,
      _$purchaseStatusEnum_PENDING,
      _$purchaseStatusEnum_ACTION_REQUIRED,
      _$purchaseStatusEnum_APPROVED,
      _$purchaseStatusEnum_REJECTED,
      _$purchaseStatusEnum_EXPIRED,
    ]);

Serializer<PurchaseStatusEnum> _$purchaseStatusEnumSerializer =
    _$PurchaseStatusEnumSerializer();

class _$PurchaseStatusEnumSerializer
    implements PrimitiveSerializer<PurchaseStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'AWAITING_PAYMENT': 'AWAITING_PAYMENT',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'EXPIRED': 'EXPIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'AWAITING_PAYMENT': 'AWAITING_PAYMENT',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'EXPIRED': 'EXPIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[PurchaseStatusEnum];
  @override
  final String wireName = 'PurchaseStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PurchaseStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PurchaseStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PurchaseStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class PurchaseBuilder {
  void replace(Purchase other);
  void update(void Function(PurchaseBuilder) updates);
  String? get id;
  set id(String? id);

  String? get branchId;
  set branchId(String? branchId);

  String? get userId;
  set userId(String? userId);

  String? get packageId;
  set packageId(String? packageId);

  String? get paymentProofId;
  set paymentProofId(String? paymentProofId);

  String? get packageNameSnapshot;
  set packageNameSnapshot(String? packageNameSnapshot);

  int? get priceRpSnapshot;
  set priceRpSnapshot(int? priceRpSnapshot);

  int? get paymentUniqueCode;
  set paymentUniqueCode(int? paymentUniqueCode);

  int? get payableAmountRpSnapshot;
  set payableAmountRpSnapshot(int? payableAmountRpSnapshot);

  int? get sessionCountSnapshot;
  set sessionCountSnapshot(int? sessionCountSnapshot);

  int? get durationDaysSnapshot;
  set durationDaysSnapshot(int? durationDaysSnapshot);

  PurchaseStatusEnum? get status;
  set status(PurchaseStatusEnum? status);

  DateTime? get submittedAt;
  set submittedAt(DateTime? submittedAt);

  DateTime? get paymentExpiresAt;
  set paymentExpiresAt(DateTime? paymentExpiresAt);

  DateTime? get decidedAt;
  set decidedAt(DateTime? decidedAt);

  String? get decidedById;
  set decidedById(String? decidedById);

  String? get decisionReasonCode;
  set decisionReasonCode(String? decisionReasonCode);

  String? get auditReference;
  set auditReference(String? auditReference);

  int? get version;
  set version(int? version);
}

class _$$Purchase extends $Purchase {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String userId;
  @override
  final String packageId;
  @override
  final String? paymentProofId;
  @override
  final String packageNameSnapshot;
  @override
  final int priceRpSnapshot;
  @override
  final int? paymentUniqueCode;
  @override
  final int? payableAmountRpSnapshot;
  @override
  final int sessionCountSnapshot;
  @override
  final int durationDaysSnapshot;
  @override
  final PurchaseStatusEnum status;
  @override
  final DateTime submittedAt;
  @override
  final DateTime? paymentExpiresAt;
  @override
  final DateTime? decidedAt;
  @override
  final String? decidedById;
  @override
  final String? decisionReasonCode;
  @override
  final String? auditReference;
  @override
  final int version;

  factory _$$Purchase([void Function($PurchaseBuilder)? updates]) =>
      ($PurchaseBuilder()..update(updates))._build();

  _$$Purchase._({
    required this.id,
    required this.branchId,
    required this.userId,
    required this.packageId,
    this.paymentProofId,
    required this.packageNameSnapshot,
    required this.priceRpSnapshot,
    this.paymentUniqueCode,
    this.payableAmountRpSnapshot,
    required this.sessionCountSnapshot,
    required this.durationDaysSnapshot,
    required this.status,
    required this.submittedAt,
    this.paymentExpiresAt,
    this.decidedAt,
    this.decidedById,
    this.decisionReasonCode,
    this.auditReference,
    required this.version,
  }) : super._();
  @override
  $Purchase rebuild(void Function($PurchaseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $PurchaseBuilder toBuilder() => $PurchaseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $Purchase &&
        id == other.id &&
        branchId == other.branchId &&
        userId == other.userId &&
        packageId == other.packageId &&
        paymentProofId == other.paymentProofId &&
        packageNameSnapshot == other.packageNameSnapshot &&
        priceRpSnapshot == other.priceRpSnapshot &&
        paymentUniqueCode == other.paymentUniqueCode &&
        payableAmountRpSnapshot == other.payableAmountRpSnapshot &&
        sessionCountSnapshot == other.sessionCountSnapshot &&
        durationDaysSnapshot == other.durationDaysSnapshot &&
        status == other.status &&
        submittedAt == other.submittedAt &&
        paymentExpiresAt == other.paymentExpiresAt &&
        decidedAt == other.decidedAt &&
        decidedById == other.decidedById &&
        decisionReasonCode == other.decisionReasonCode &&
        auditReference == other.auditReference &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, userId.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, paymentProofId.hashCode);
    _$hash = $jc(_$hash, packageNameSnapshot.hashCode);
    _$hash = $jc(_$hash, priceRpSnapshot.hashCode);
    _$hash = $jc(_$hash, paymentUniqueCode.hashCode);
    _$hash = $jc(_$hash, payableAmountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, sessionCountSnapshot.hashCode);
    _$hash = $jc(_$hash, durationDaysSnapshot.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jc(_$hash, paymentExpiresAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jc(_$hash, decidedById.hashCode);
    _$hash = $jc(_$hash, decisionReasonCode.hashCode);
    _$hash = $jc(_$hash, auditReference.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$Purchase')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('userId', userId)
          ..add('packageId', packageId)
          ..add('paymentProofId', paymentProofId)
          ..add('packageNameSnapshot', packageNameSnapshot)
          ..add('priceRpSnapshot', priceRpSnapshot)
          ..add('paymentUniqueCode', paymentUniqueCode)
          ..add('payableAmountRpSnapshot', payableAmountRpSnapshot)
          ..add('sessionCountSnapshot', sessionCountSnapshot)
          ..add('durationDaysSnapshot', durationDaysSnapshot)
          ..add('status', status)
          ..add('submittedAt', submittedAt)
          ..add('paymentExpiresAt', paymentExpiresAt)
          ..add('decidedAt', decidedAt)
          ..add('decidedById', decidedById)
          ..add('decisionReasonCode', decisionReasonCode)
          ..add('auditReference', auditReference)
          ..add('version', version))
        .toString();
  }
}

class $PurchaseBuilder
    implements Builder<$Purchase, $PurchaseBuilder>, PurchaseBuilder {
  _$$Purchase? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _userId;
  String? get userId => _$this._userId;
  set userId(covariant String? userId) => _$this._userId = userId;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(covariant String? packageId) => _$this._packageId = packageId;

  String? _paymentProofId;
  String? get paymentProofId => _$this._paymentProofId;
  set paymentProofId(covariant String? paymentProofId) =>
      _$this._paymentProofId = paymentProofId;

  String? _packageNameSnapshot;
  String? get packageNameSnapshot => _$this._packageNameSnapshot;
  set packageNameSnapshot(covariant String? packageNameSnapshot) =>
      _$this._packageNameSnapshot = packageNameSnapshot;

  int? _priceRpSnapshot;
  int? get priceRpSnapshot => _$this._priceRpSnapshot;
  set priceRpSnapshot(covariant int? priceRpSnapshot) =>
      _$this._priceRpSnapshot = priceRpSnapshot;

  int? _paymentUniqueCode;
  int? get paymentUniqueCode => _$this._paymentUniqueCode;
  set paymentUniqueCode(covariant int? paymentUniqueCode) =>
      _$this._paymentUniqueCode = paymentUniqueCode;

  int? _payableAmountRpSnapshot;
  int? get payableAmountRpSnapshot => _$this._payableAmountRpSnapshot;
  set payableAmountRpSnapshot(covariant int? payableAmountRpSnapshot) =>
      _$this._payableAmountRpSnapshot = payableAmountRpSnapshot;

  int? _sessionCountSnapshot;
  int? get sessionCountSnapshot => _$this._sessionCountSnapshot;
  set sessionCountSnapshot(covariant int? sessionCountSnapshot) =>
      _$this._sessionCountSnapshot = sessionCountSnapshot;

  int? _durationDaysSnapshot;
  int? get durationDaysSnapshot => _$this._durationDaysSnapshot;
  set durationDaysSnapshot(covariant int? durationDaysSnapshot) =>
      _$this._durationDaysSnapshot = durationDaysSnapshot;

  PurchaseStatusEnum? _status;
  PurchaseStatusEnum? get status => _$this._status;
  set status(covariant PurchaseStatusEnum? status) => _$this._status = status;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(covariant DateTime? submittedAt) =>
      _$this._submittedAt = submittedAt;

  DateTime? _paymentExpiresAt;
  DateTime? get paymentExpiresAt => _$this._paymentExpiresAt;
  set paymentExpiresAt(covariant DateTime? paymentExpiresAt) =>
      _$this._paymentExpiresAt = paymentExpiresAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(covariant DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  String? _decidedById;
  String? get decidedById => _$this._decidedById;
  set decidedById(covariant String? decidedById) =>
      _$this._decidedById = decidedById;

  String? _decisionReasonCode;
  String? get decisionReasonCode => _$this._decisionReasonCode;
  set decisionReasonCode(covariant String? decisionReasonCode) =>
      _$this._decisionReasonCode = decisionReasonCode;

  String? _auditReference;
  String? get auditReference => _$this._auditReference;
  set auditReference(covariant String? auditReference) =>
      _$this._auditReference = auditReference;

  int? _version;
  int? get version => _$this._version;
  set version(covariant int? version) => _$this._version = version;

  $PurchaseBuilder() {
    $Purchase._defaults(this);
  }

  $PurchaseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _userId = $v.userId;
      _packageId = $v.packageId;
      _paymentProofId = $v.paymentProofId;
      _packageNameSnapshot = $v.packageNameSnapshot;
      _priceRpSnapshot = $v.priceRpSnapshot;
      _paymentUniqueCode = $v.paymentUniqueCode;
      _payableAmountRpSnapshot = $v.payableAmountRpSnapshot;
      _sessionCountSnapshot = $v.sessionCountSnapshot;
      _durationDaysSnapshot = $v.durationDaysSnapshot;
      _status = $v.status;
      _submittedAt = $v.submittedAt;
      _paymentExpiresAt = $v.paymentExpiresAt;
      _decidedAt = $v.decidedAt;
      _decidedById = $v.decidedById;
      _decisionReasonCode = $v.decisionReasonCode;
      _auditReference = $v.auditReference;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $Purchase other) {
    _$v = other as _$$Purchase;
  }

  @override
  void update(void Function($PurchaseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $Purchase build() => _build();

  _$$Purchase _build() {
    final _$result =
        _$v ??
        _$$Purchase._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'$Purchase', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'$Purchase',
            'branchId',
          ),
          userId: BuiltValueNullFieldError.checkNotNull(
            userId,
            r'$Purchase',
            'userId',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'$Purchase',
            'packageId',
          ),
          paymentProofId: paymentProofId,
          packageNameSnapshot: BuiltValueNullFieldError.checkNotNull(
            packageNameSnapshot,
            r'$Purchase',
            'packageNameSnapshot',
          ),
          priceRpSnapshot: BuiltValueNullFieldError.checkNotNull(
            priceRpSnapshot,
            r'$Purchase',
            'priceRpSnapshot',
          ),
          paymentUniqueCode: paymentUniqueCode,
          payableAmountRpSnapshot: payableAmountRpSnapshot,
          sessionCountSnapshot: BuiltValueNullFieldError.checkNotNull(
            sessionCountSnapshot,
            r'$Purchase',
            'sessionCountSnapshot',
          ),
          durationDaysSnapshot: BuiltValueNullFieldError.checkNotNull(
            durationDaysSnapshot,
            r'$Purchase',
            'durationDaysSnapshot',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'$Purchase',
            'status',
          ),
          submittedAt: BuiltValueNullFieldError.checkNotNull(
            submittedAt,
            r'$Purchase',
            'submittedAt',
          ),
          paymentExpiresAt: paymentExpiresAt,
          decidedAt: decidedAt,
          decidedById: decidedById,
          decisionReasonCode: decisionReasonCode,
          auditReference: auditReference,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'$Purchase',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
