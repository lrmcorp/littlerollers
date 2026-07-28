// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentReviewItemStatusEnum
_$paymentReviewItemStatusEnum_AWAITING_PAYMENT =
    const PaymentReviewItemStatusEnum._('AWAITING_PAYMENT');
const PaymentReviewItemStatusEnum _$paymentReviewItemStatusEnum_PENDING =
    const PaymentReviewItemStatusEnum._('PENDING');
const PaymentReviewItemStatusEnum
_$paymentReviewItemStatusEnum_ACTION_REQUIRED =
    const PaymentReviewItemStatusEnum._('ACTION_REQUIRED');
const PaymentReviewItemStatusEnum _$paymentReviewItemStatusEnum_APPROVED =
    const PaymentReviewItemStatusEnum._('APPROVED');
const PaymentReviewItemStatusEnum _$paymentReviewItemStatusEnum_REJECTED =
    const PaymentReviewItemStatusEnum._('REJECTED');
const PaymentReviewItemStatusEnum _$paymentReviewItemStatusEnum_EXPIRED =
    const PaymentReviewItemStatusEnum._('EXPIRED');

PaymentReviewItemStatusEnum _$paymentReviewItemStatusEnumValueOf(String name) {
  switch (name) {
    case 'AWAITING_PAYMENT':
      return _$paymentReviewItemStatusEnum_AWAITING_PAYMENT;
    case 'PENDING':
      return _$paymentReviewItemStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$paymentReviewItemStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$paymentReviewItemStatusEnum_APPROVED;
    case 'REJECTED':
      return _$paymentReviewItemStatusEnum_REJECTED;
    case 'EXPIRED':
      return _$paymentReviewItemStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentReviewItemStatusEnum>
_$paymentReviewItemStatusEnumValues =
    BuiltSet<PaymentReviewItemStatusEnum>(const <PaymentReviewItemStatusEnum>[
      _$paymentReviewItemStatusEnum_AWAITING_PAYMENT,
      _$paymentReviewItemStatusEnum_PENDING,
      _$paymentReviewItemStatusEnum_ACTION_REQUIRED,
      _$paymentReviewItemStatusEnum_APPROVED,
      _$paymentReviewItemStatusEnum_REJECTED,
      _$paymentReviewItemStatusEnum_EXPIRED,
    ]);

Serializer<PaymentReviewItemStatusEnum>
_$paymentReviewItemStatusEnumSerializer =
    _$PaymentReviewItemStatusEnumSerializer();

class _$PaymentReviewItemStatusEnumSerializer
    implements PrimitiveSerializer<PaymentReviewItemStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentReviewItemStatusEnum];
  @override
  final String wireName = 'PaymentReviewItemStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewItemStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentReviewItemStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentReviewItemStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentReviewItem extends PaymentReviewItem {
  @override
  final PaymentReviewProof? paymentProof;
  @override
  final PaymentActivationSummary? activationSummary;
  @override
  final PaymentReviewBranch branch;
  @override
  final PaymentReviewCustomer customer;
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

  factory _$PaymentReviewItem([
    void Function(PaymentReviewItemBuilder)? updates,
  ]) => (PaymentReviewItemBuilder()..update(updates))._build();

  _$PaymentReviewItem._({
    this.paymentProof,
    this.activationSummary,
    required this.branch,
    required this.customer,
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
  PaymentReviewItem rebuild(void Function(PaymentReviewItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PaymentReviewItemBuilder toBuilder() =>
      PaymentReviewItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewItem &&
        paymentProof == other.paymentProof &&
        activationSummary == other.activationSummary &&
        branch == other.branch &&
        customer == other.customer &&
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
    _$hash = $jc(_$hash, paymentProof.hashCode);
    _$hash = $jc(_$hash, activationSummary.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, customer.hashCode);
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
    return (newBuiltValueToStringHelper(r'PaymentReviewItem')
          ..add('paymentProof', paymentProof)
          ..add('activationSummary', activationSummary)
          ..add('branch', branch)
          ..add('customer', customer)
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

class PaymentReviewItemBuilder
    implements
        Builder<PaymentReviewItem, PaymentReviewItemBuilder>,
        PurchaseBuilder {
  _$PaymentReviewItem? _$v;

  PaymentReviewProofBuilder? _paymentProof;
  PaymentReviewProofBuilder get paymentProof =>
      _$this._paymentProof ??= PaymentReviewProofBuilder();
  set paymentProof(covariant PaymentReviewProofBuilder? paymentProof) =>
      _$this._paymentProof = paymentProof;

  PaymentActivationSummaryBuilder? _activationSummary;
  PaymentActivationSummaryBuilder get activationSummary =>
      _$this._activationSummary ??= PaymentActivationSummaryBuilder();
  set activationSummary(
    covariant PaymentActivationSummaryBuilder? activationSummary,
  ) => _$this._activationSummary = activationSummary;

  PaymentReviewBranchBuilder? _branch;
  PaymentReviewBranchBuilder get branch =>
      _$this._branch ??= PaymentReviewBranchBuilder();
  set branch(covariant PaymentReviewBranchBuilder? branch) =>
      _$this._branch = branch;

  PaymentReviewCustomerBuilder? _customer;
  PaymentReviewCustomerBuilder get customer =>
      _$this._customer ??= PaymentReviewCustomerBuilder();
  set customer(covariant PaymentReviewCustomerBuilder? customer) =>
      _$this._customer = customer;

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

  PaymentReviewItemBuilder() {
    PaymentReviewItem._defaults(this);
  }

  PaymentReviewItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _paymentProof = $v.paymentProof?.toBuilder();
      _activationSummary = $v.activationSummary?.toBuilder();
      _branch = $v.branch.toBuilder();
      _customer = $v.customer.toBuilder();
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
  void replace(covariant PaymentReviewItem other) {
    _$v = other as _$PaymentReviewItem;
  }

  @override
  void update(void Function(PaymentReviewItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewItem build() => _build();

  _$PaymentReviewItem _build() {
    _$PaymentReviewItem _$result;
    try {
      _$result =
          _$v ??
          _$PaymentReviewItem._(
            paymentProof: _paymentProof?.build(),
            activationSummary: _activationSummary?.build(),
            branch: branch.build(),
            customer: customer.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PaymentReviewItem',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'PaymentReviewItem',
              'branchId',
            ),
            userId: BuiltValueNullFieldError.checkNotNull(
              userId,
              r'PaymentReviewItem',
              'userId',
            ),
            packageId: BuiltValueNullFieldError.checkNotNull(
              packageId,
              r'PaymentReviewItem',
              'packageId',
            ),
            paymentProofId: paymentProofId,
            packageNameSnapshot: BuiltValueNullFieldError.checkNotNull(
              packageNameSnapshot,
              r'PaymentReviewItem',
              'packageNameSnapshot',
            ),
            priceRpSnapshot: BuiltValueNullFieldError.checkNotNull(
              priceRpSnapshot,
              r'PaymentReviewItem',
              'priceRpSnapshot',
            ),
            paymentUniqueCode: paymentUniqueCode,
            payableAmountRpSnapshot: payableAmountRpSnapshot,
            sessionCountSnapshot: BuiltValueNullFieldError.checkNotNull(
              sessionCountSnapshot,
              r'PaymentReviewItem',
              'sessionCountSnapshot',
            ),
            durationDaysSnapshot: BuiltValueNullFieldError.checkNotNull(
              durationDaysSnapshot,
              r'PaymentReviewItem',
              'durationDaysSnapshot',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'PaymentReviewItem',
              'status',
            ),
            submittedAt: BuiltValueNullFieldError.checkNotNull(
              submittedAt,
              r'PaymentReviewItem',
              'submittedAt',
            ),
            paymentExpiresAt: paymentExpiresAt,
            decidedAt: decidedAt,
            decidedById: decidedById,
            decisionReasonCode: decisionReasonCode,
            auditReference: auditReference,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'PaymentReviewItem',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'paymentProof';
        _paymentProof?.build();
        _$failedField = 'activationSummary';
        _activationSummary?.build();
        _$failedField = 'branch';
        branch.build();
        _$failedField = 'customer';
        customer.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PaymentReviewItem',
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
