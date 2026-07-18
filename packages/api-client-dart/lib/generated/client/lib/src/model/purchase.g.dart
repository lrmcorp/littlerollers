// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'purchase.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PurchaseStatusEnum _$purchaseStatusEnum_PENDING =
    const PurchaseStatusEnum._('PENDING');
const PurchaseStatusEnum _$purchaseStatusEnum_APPROVED =
    const PurchaseStatusEnum._('APPROVED');
const PurchaseStatusEnum _$purchaseStatusEnum_REJECTED =
    const PurchaseStatusEnum._('REJECTED');

PurchaseStatusEnum _$purchaseStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$purchaseStatusEnum_PENDING;
    case 'APPROVED':
      return _$purchaseStatusEnum_APPROVED;
    case 'REJECTED':
      return _$purchaseStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PurchaseStatusEnum> _$purchaseStatusEnumValues =
    BuiltSet<PurchaseStatusEnum>(const <PurchaseStatusEnum>[
      _$purchaseStatusEnum_PENDING,
      _$purchaseStatusEnum_APPROVED,
      _$purchaseStatusEnum_REJECTED,
    ]);

Serializer<PurchaseStatusEnum> _$purchaseStatusEnumSerializer =
    _$PurchaseStatusEnumSerializer();

class _$PurchaseStatusEnumSerializer
    implements PrimitiveSerializer<PurchaseStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
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

class _$Purchase extends Purchase {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String customerUserId;
  @override
  final String packageId;
  @override
  final String? paymentProofId;
  @override
  final PurchaseStatusEnum status;
  @override
  final DateTime submittedAt;
  @override
  final DateTime? decidedAt;
  @override
  final String? reason;

  factory _$Purchase([void Function(PurchaseBuilder)? updates]) =>
      (PurchaseBuilder()..update(updates))._build();

  _$Purchase._({
    required this.id,
    required this.branchId,
    required this.customerUserId,
    required this.packageId,
    this.paymentProofId,
    required this.status,
    required this.submittedAt,
    this.decidedAt,
    this.reason,
  }) : super._();
  @override
  Purchase rebuild(void Function(PurchaseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PurchaseBuilder toBuilder() => PurchaseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Purchase &&
        id == other.id &&
        branchId == other.branchId &&
        customerUserId == other.customerUserId &&
        packageId == other.packageId &&
        paymentProofId == other.paymentProofId &&
        status == other.status &&
        submittedAt == other.submittedAt &&
        decidedAt == other.decidedAt &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, paymentProofId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Purchase')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('customerUserId', customerUserId)
          ..add('packageId', packageId)
          ..add('paymentProofId', paymentProofId)
          ..add('status', status)
          ..add('submittedAt', submittedAt)
          ..add('decidedAt', decidedAt)
          ..add('reason', reason))
        .toString();
  }
}

class PurchaseBuilder implements Builder<Purchase, PurchaseBuilder> {
  _$Purchase? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _customerUserId;
  String? get customerUserId => _$this._customerUserId;
  set customerUserId(String? customerUserId) =>
      _$this._customerUserId = customerUserId;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _paymentProofId;
  String? get paymentProofId => _$this._paymentProofId;
  set paymentProofId(String? paymentProofId) =>
      _$this._paymentProofId = paymentProofId;

  PurchaseStatusEnum? _status;
  PurchaseStatusEnum? get status => _$this._status;
  set status(PurchaseStatusEnum? status) => _$this._status = status;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(DateTime? submittedAt) => _$this._submittedAt = submittedAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PurchaseBuilder() {
    Purchase._defaults(this);
  }

  PurchaseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _customerUserId = $v.customerUserId;
      _packageId = $v.packageId;
      _paymentProofId = $v.paymentProofId;
      _status = $v.status;
      _submittedAt = $v.submittedAt;
      _decidedAt = $v.decidedAt;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Purchase other) {
    _$v = other as _$Purchase;
  }

  @override
  void update(void Function(PurchaseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Purchase build() => _build();

  _$Purchase _build() {
    final _$result =
        _$v ??
        _$Purchase._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Purchase', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'Purchase',
            'branchId',
          ),
          customerUserId: BuiltValueNullFieldError.checkNotNull(
            customerUserId,
            r'Purchase',
            'customerUserId',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'Purchase',
            'packageId',
          ),
          paymentProofId: paymentProofId,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'Purchase',
            'status',
          ),
          submittedAt: BuiltValueNullFieldError.checkNotNull(
            submittedAt,
            r'Purchase',
            'submittedAt',
          ),
          decidedAt: decidedAt,
          reason: reason,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
