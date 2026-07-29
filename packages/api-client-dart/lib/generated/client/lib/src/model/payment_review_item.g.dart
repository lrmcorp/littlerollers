// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum
_$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_PERCENTAGE =
    const PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum._(
      'PERCENTAGE',
    );
const PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum
_$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_FIXED_AMOUNT =
    const PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum._(
      'FIXED_AMOUNT',
    );

PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum
_$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PERCENTAGE':
      return _$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum>
_$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnumValues =
    BuiltSet<PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum>(const <
      PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum
    >[
      _$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_PERCENTAGE,
      _$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnum_FIXED_AMOUNT,
    ]);

const PaymentReviewItemVoucherDiscountTypeSnapshotEnum
_$paymentReviewItemVoucherDiscountTypeSnapshotEnum_PERCENTAGE =
    const PaymentReviewItemVoucherDiscountTypeSnapshotEnum._('PERCENTAGE');
const PaymentReviewItemVoucherDiscountTypeSnapshotEnum
_$paymentReviewItemVoucherDiscountTypeSnapshotEnum_FIXED_AMOUNT =
    const PaymentReviewItemVoucherDiscountTypeSnapshotEnum._('FIXED_AMOUNT');

PaymentReviewItemVoucherDiscountTypeSnapshotEnum
_$paymentReviewItemVoucherDiscountTypeSnapshotEnumValueOf(String name) {
  switch (name) {
    case 'PERCENTAGE':
      return _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentReviewItemVoucherDiscountTypeSnapshotEnum>
_$paymentReviewItemVoucherDiscountTypeSnapshotEnumValues =
    BuiltSet<PaymentReviewItemVoucherDiscountTypeSnapshotEnum>(
      const <PaymentReviewItemVoucherDiscountTypeSnapshotEnum>[
        _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_PERCENTAGE,
        _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_FIXED_AMOUNT,
      ],
    );

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

Serializer<PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum>
_$paymentReviewItemPackagePromotionDiscountTypeSnapshotEnumSerializer =
    _$PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnumSerializer();
Serializer<PaymentReviewItemVoucherDiscountTypeSnapshotEnum>
_$paymentReviewItemVoucherDiscountTypeSnapshotEnumSerializer =
    _$PaymentReviewItemVoucherDiscountTypeSnapshotEnumSerializer();
Serializer<PaymentReviewItemStatusEnum>
_$paymentReviewItemStatusEnumSerializer =
    _$PaymentReviewItemStatusEnumSerializer();

class _$PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnumSerializer
    implements
        PrimitiveSerializer<
          PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum,
  ];
  @override
  final String wireName =
      'PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentReviewItemPackagePromotionDiscountTypeSnapshotEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentReviewItemVoucherDiscountTypeSnapshotEnumSerializer
    implements
        PrimitiveSerializer<PaymentReviewItemVoucherDiscountTypeSnapshotEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    PaymentReviewItemVoucherDiscountTypeSnapshotEnum,
  ];
  @override
  final String wireName = 'PaymentReviewItemVoucherDiscountTypeSnapshotEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewItemVoucherDiscountTypeSnapshotEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentReviewItemVoucherDiscountTypeSnapshotEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentReviewItemVoucherDiscountTypeSnapshotEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

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
  final String? packagePromotionId;
  @override
  final String? packagePromotionNameSnapshot;
  @override
  final PurchasePackagePromotionDiscountTypeSnapshotEnum?
  packagePromotionDiscountTypeSnapshot;
  @override
  final int? packagePromotionDiscountValueSnapshot;
  @override
  final int? packagePromotionDiscountRpSnapshot;
  @override
  final int? promotionalPriceRpSnapshot;
  @override
  final String? voucherId;
  @override
  final String? voucherCodeSnapshot;
  @override
  final PurchaseVoucherDiscountTypeSnapshotEnum? voucherDiscountTypeSnapshot;
  @override
  final int? voucherDiscountValueSnapshot;
  @override
  final int? voucherDiscountRpSnapshot;
  @override
  final int? priceAfterDiscountRpSnapshot;
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
    this.packagePromotionId,
    this.packagePromotionNameSnapshot,
    this.packagePromotionDiscountTypeSnapshot,
    this.packagePromotionDiscountValueSnapshot,
    this.packagePromotionDiscountRpSnapshot,
    this.promotionalPriceRpSnapshot,
    this.voucherId,
    this.voucherCodeSnapshot,
    this.voucherDiscountTypeSnapshot,
    this.voucherDiscountValueSnapshot,
    this.voucherDiscountRpSnapshot,
    this.priceAfterDiscountRpSnapshot,
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
        packagePromotionId == other.packagePromotionId &&
        packagePromotionNameSnapshot == other.packagePromotionNameSnapshot &&
        packagePromotionDiscountTypeSnapshot ==
            other.packagePromotionDiscountTypeSnapshot &&
        packagePromotionDiscountValueSnapshot ==
            other.packagePromotionDiscountValueSnapshot &&
        packagePromotionDiscountRpSnapshot ==
            other.packagePromotionDiscountRpSnapshot &&
        promotionalPriceRpSnapshot == other.promotionalPriceRpSnapshot &&
        voucherId == other.voucherId &&
        voucherCodeSnapshot == other.voucherCodeSnapshot &&
        voucherDiscountTypeSnapshot == other.voucherDiscountTypeSnapshot &&
        voucherDiscountValueSnapshot == other.voucherDiscountValueSnapshot &&
        voucherDiscountRpSnapshot == other.voucherDiscountRpSnapshot &&
        priceAfterDiscountRpSnapshot == other.priceAfterDiscountRpSnapshot &&
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
    _$hash = $jc(_$hash, packagePromotionId.hashCode);
    _$hash = $jc(_$hash, packagePromotionNameSnapshot.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountTypeSnapshot.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountValueSnapshot.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, promotionalPriceRpSnapshot.hashCode);
    _$hash = $jc(_$hash, voucherId.hashCode);
    _$hash = $jc(_$hash, voucherCodeSnapshot.hashCode);
    _$hash = $jc(_$hash, voucherDiscountTypeSnapshot.hashCode);
    _$hash = $jc(_$hash, voucherDiscountValueSnapshot.hashCode);
    _$hash = $jc(_$hash, voucherDiscountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, priceAfterDiscountRpSnapshot.hashCode);
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
          ..add('packagePromotionId', packagePromotionId)
          ..add('packagePromotionNameSnapshot', packagePromotionNameSnapshot)
          ..add(
            'packagePromotionDiscountTypeSnapshot',
            packagePromotionDiscountTypeSnapshot,
          )
          ..add(
            'packagePromotionDiscountValueSnapshot',
            packagePromotionDiscountValueSnapshot,
          )
          ..add(
            'packagePromotionDiscountRpSnapshot',
            packagePromotionDiscountRpSnapshot,
          )
          ..add('promotionalPriceRpSnapshot', promotionalPriceRpSnapshot)
          ..add('voucherId', voucherId)
          ..add('voucherCodeSnapshot', voucherCodeSnapshot)
          ..add('voucherDiscountTypeSnapshot', voucherDiscountTypeSnapshot)
          ..add('voucherDiscountValueSnapshot', voucherDiscountValueSnapshot)
          ..add('voucherDiscountRpSnapshot', voucherDiscountRpSnapshot)
          ..add('priceAfterDiscountRpSnapshot', priceAfterDiscountRpSnapshot)
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

  String? _packagePromotionId;
  String? get packagePromotionId => _$this._packagePromotionId;
  set packagePromotionId(covariant String? packagePromotionId) =>
      _$this._packagePromotionId = packagePromotionId;

  String? _packagePromotionNameSnapshot;
  String? get packagePromotionNameSnapshot =>
      _$this._packagePromotionNameSnapshot;
  set packagePromotionNameSnapshot(
    covariant String? packagePromotionNameSnapshot,
  ) => _$this._packagePromotionNameSnapshot = packagePromotionNameSnapshot;

  PurchasePackagePromotionDiscountTypeSnapshotEnum?
  _packagePromotionDiscountTypeSnapshot;
  PurchasePackagePromotionDiscountTypeSnapshotEnum?
  get packagePromotionDiscountTypeSnapshot =>
      _$this._packagePromotionDiscountTypeSnapshot;
  set packagePromotionDiscountTypeSnapshot(
    covariant PurchasePackagePromotionDiscountTypeSnapshotEnum?
    packagePromotionDiscountTypeSnapshot,
  ) => _$this._packagePromotionDiscountTypeSnapshot =
      packagePromotionDiscountTypeSnapshot;

  int? _packagePromotionDiscountValueSnapshot;
  int? get packagePromotionDiscountValueSnapshot =>
      _$this._packagePromotionDiscountValueSnapshot;
  set packagePromotionDiscountValueSnapshot(
    covariant int? packagePromotionDiscountValueSnapshot,
  ) => _$this._packagePromotionDiscountValueSnapshot =
      packagePromotionDiscountValueSnapshot;

  int? _packagePromotionDiscountRpSnapshot;
  int? get packagePromotionDiscountRpSnapshot =>
      _$this._packagePromotionDiscountRpSnapshot;
  set packagePromotionDiscountRpSnapshot(
    covariant int? packagePromotionDiscountRpSnapshot,
  ) => _$this._packagePromotionDiscountRpSnapshot =
      packagePromotionDiscountRpSnapshot;

  int? _promotionalPriceRpSnapshot;
  int? get promotionalPriceRpSnapshot => _$this._promotionalPriceRpSnapshot;
  set promotionalPriceRpSnapshot(covariant int? promotionalPriceRpSnapshot) =>
      _$this._promotionalPriceRpSnapshot = promotionalPriceRpSnapshot;

  String? _voucherId;
  String? get voucherId => _$this._voucherId;
  set voucherId(covariant String? voucherId) => _$this._voucherId = voucherId;

  String? _voucherCodeSnapshot;
  String? get voucherCodeSnapshot => _$this._voucherCodeSnapshot;
  set voucherCodeSnapshot(covariant String? voucherCodeSnapshot) =>
      _$this._voucherCodeSnapshot = voucherCodeSnapshot;

  PurchaseVoucherDiscountTypeSnapshotEnum? _voucherDiscountTypeSnapshot;
  PurchaseVoucherDiscountTypeSnapshotEnum? get voucherDiscountTypeSnapshot =>
      _$this._voucherDiscountTypeSnapshot;
  set voucherDiscountTypeSnapshot(
    covariant PurchaseVoucherDiscountTypeSnapshotEnum?
    voucherDiscountTypeSnapshot,
  ) => _$this._voucherDiscountTypeSnapshot = voucherDiscountTypeSnapshot;

  int? _voucherDiscountValueSnapshot;
  int? get voucherDiscountValueSnapshot => _$this._voucherDiscountValueSnapshot;
  set voucherDiscountValueSnapshot(
    covariant int? voucherDiscountValueSnapshot,
  ) => _$this._voucherDiscountValueSnapshot = voucherDiscountValueSnapshot;

  int? _voucherDiscountRpSnapshot;
  int? get voucherDiscountRpSnapshot => _$this._voucherDiscountRpSnapshot;
  set voucherDiscountRpSnapshot(covariant int? voucherDiscountRpSnapshot) =>
      _$this._voucherDiscountRpSnapshot = voucherDiscountRpSnapshot;

  int? _priceAfterDiscountRpSnapshot;
  int? get priceAfterDiscountRpSnapshot => _$this._priceAfterDiscountRpSnapshot;
  set priceAfterDiscountRpSnapshot(
    covariant int? priceAfterDiscountRpSnapshot,
  ) => _$this._priceAfterDiscountRpSnapshot = priceAfterDiscountRpSnapshot;

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
      _packagePromotionId = $v.packagePromotionId;
      _packagePromotionNameSnapshot = $v.packagePromotionNameSnapshot;
      _packagePromotionDiscountTypeSnapshot =
          $v.packagePromotionDiscountTypeSnapshot;
      _packagePromotionDiscountValueSnapshot =
          $v.packagePromotionDiscountValueSnapshot;
      _packagePromotionDiscountRpSnapshot =
          $v.packagePromotionDiscountRpSnapshot;
      _promotionalPriceRpSnapshot = $v.promotionalPriceRpSnapshot;
      _voucherId = $v.voucherId;
      _voucherCodeSnapshot = $v.voucherCodeSnapshot;
      _voucherDiscountTypeSnapshot = $v.voucherDiscountTypeSnapshot;
      _voucherDiscountValueSnapshot = $v.voucherDiscountValueSnapshot;
      _voucherDiscountRpSnapshot = $v.voucherDiscountRpSnapshot;
      _priceAfterDiscountRpSnapshot = $v.priceAfterDiscountRpSnapshot;
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
            packagePromotionId: packagePromotionId,
            packagePromotionNameSnapshot: packagePromotionNameSnapshot,
            packagePromotionDiscountTypeSnapshot:
                packagePromotionDiscountTypeSnapshot,
            packagePromotionDiscountValueSnapshot:
                packagePromotionDiscountValueSnapshot,
            packagePromotionDiscountRpSnapshot:
                packagePromotionDiscountRpSnapshot,
            promotionalPriceRpSnapshot: promotionalPriceRpSnapshot,
            voucherId: voucherId,
            voucherCodeSnapshot: voucherCodeSnapshot,
            voucherDiscountTypeSnapshot: voucherDiscountTypeSnapshot,
            voucherDiscountValueSnapshot: voucherDiscountValueSnapshot,
            voucherDiscountRpSnapshot: voucherDiscountRpSnapshot,
            priceAfterDiscountRpSnapshot: priceAfterDiscountRpSnapshot,
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
