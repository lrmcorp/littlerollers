// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OrderStatusEnum _$orderStatusEnum_AWAITING_PAYMENT =
    const OrderStatusEnum._('AWAITING_PAYMENT');
const OrderStatusEnum _$orderStatusEnum_PENDING = const OrderStatusEnum._(
  'PENDING',
);
const OrderStatusEnum _$orderStatusEnum_ACTION_REQUIRED =
    const OrderStatusEnum._('ACTION_REQUIRED');
const OrderStatusEnum _$orderStatusEnum_APPROVED = const OrderStatusEnum._(
  'APPROVED',
);
const OrderStatusEnum _$orderStatusEnum_REJECTED = const OrderStatusEnum._(
  'REJECTED',
);
const OrderStatusEnum _$orderStatusEnum_EXPIRED = const OrderStatusEnum._(
  'EXPIRED',
);

OrderStatusEnum _$orderStatusEnumValueOf(String name) {
  switch (name) {
    case 'AWAITING_PAYMENT':
      return _$orderStatusEnum_AWAITING_PAYMENT;
    case 'PENDING':
      return _$orderStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$orderStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$orderStatusEnum_APPROVED;
    case 'REJECTED':
      return _$orderStatusEnum_REJECTED;
    case 'EXPIRED':
      return _$orderStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OrderStatusEnum> _$orderStatusEnumValues =
    BuiltSet<OrderStatusEnum>(const <OrderStatusEnum>[
      _$orderStatusEnum_AWAITING_PAYMENT,
      _$orderStatusEnum_PENDING,
      _$orderStatusEnum_ACTION_REQUIRED,
      _$orderStatusEnum_APPROVED,
      _$orderStatusEnum_REJECTED,
      _$orderStatusEnum_EXPIRED,
    ]);

Serializer<OrderStatusEnum> _$orderStatusEnumSerializer =
    _$OrderStatusEnumSerializer();

class _$OrderStatusEnumSerializer
    implements PrimitiveSerializer<OrderStatusEnum> {
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
  final Iterable<Type> types = const <Type>[OrderStatusEnum];
  @override
  final String wireName = 'OrderStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OrderStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OrderStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OrderStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Order extends Order {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String? branchName;
  @override
  final String packageId;
  @override
  final String packageName;
  @override
  final int priceRp;
  @override
  final int sessionCount;
  @override
  final int durationDays;
  @override
  final OrderStatusEnum status;
  @override
  final DateTime submittedAt;
  @override
  final DateTime? expiresAt;
  @override
  final String? continuationSlotId;
  @override
  final String? paymentProofId;
  @override
  final String? decisionReasonCode;
  @override
  final int version;
  @override
  final OrderPaymentAccount? paymentAccount;

  factory _$Order([void Function(OrderBuilder)? updates]) =>
      (OrderBuilder()..update(updates))._build();

  _$Order._({
    required this.id,
    required this.branchId,
    this.branchName,
    required this.packageId,
    required this.packageName,
    required this.priceRp,
    required this.sessionCount,
    required this.durationDays,
    required this.status,
    required this.submittedAt,
    this.expiresAt,
    this.continuationSlotId,
    this.paymentProofId,
    this.decisionReasonCode,
    required this.version,
    this.paymentAccount,
  }) : super._();
  @override
  Order rebuild(void Function(OrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderBuilder toBuilder() => OrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Order &&
        id == other.id &&
        branchId == other.branchId &&
        branchName == other.branchName &&
        packageId == other.packageId &&
        packageName == other.packageName &&
        priceRp == other.priceRp &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        status == other.status &&
        submittedAt == other.submittedAt &&
        expiresAt == other.expiresAt &&
        continuationSlotId == other.continuationSlotId &&
        paymentProofId == other.paymentProofId &&
        decisionReasonCode == other.decisionReasonCode &&
        version == other.version &&
        paymentAccount == other.paymentAccount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, packageName.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, continuationSlotId.hashCode);
    _$hash = $jc(_$hash, paymentProofId.hashCode);
    _$hash = $jc(_$hash, decisionReasonCode.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, paymentAccount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Order')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('branchName', branchName)
          ..add('packageId', packageId)
          ..add('packageName', packageName)
          ..add('priceRp', priceRp)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('status', status)
          ..add('submittedAt', submittedAt)
          ..add('expiresAt', expiresAt)
          ..add('continuationSlotId', continuationSlotId)
          ..add('paymentProofId', paymentProofId)
          ..add('decisionReasonCode', decisionReasonCode)
          ..add('version', version)
          ..add('paymentAccount', paymentAccount))
        .toString();
  }
}

class OrderBuilder implements Builder<Order, OrderBuilder> {
  _$Order? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _packageName;
  String? get packageName => _$this._packageName;
  set packageName(String? packageName) => _$this._packageName = packageName;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(int? priceRp) => _$this._priceRp = priceRp;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(int? durationDays) => _$this._durationDays = durationDays;

  OrderStatusEnum? _status;
  OrderStatusEnum? get status => _$this._status;
  set status(OrderStatusEnum? status) => _$this._status = status;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(DateTime? submittedAt) => _$this._submittedAt = submittedAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  String? _continuationSlotId;
  String? get continuationSlotId => _$this._continuationSlotId;
  set continuationSlotId(String? continuationSlotId) =>
      _$this._continuationSlotId = continuationSlotId;

  String? _paymentProofId;
  String? get paymentProofId => _$this._paymentProofId;
  set paymentProofId(String? paymentProofId) =>
      _$this._paymentProofId = paymentProofId;

  String? _decisionReasonCode;
  String? get decisionReasonCode => _$this._decisionReasonCode;
  set decisionReasonCode(String? decisionReasonCode) =>
      _$this._decisionReasonCode = decisionReasonCode;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  OrderPaymentAccountBuilder? _paymentAccount;
  OrderPaymentAccountBuilder get paymentAccount =>
      _$this._paymentAccount ??= OrderPaymentAccountBuilder();
  set paymentAccount(OrderPaymentAccountBuilder? paymentAccount) =>
      _$this._paymentAccount = paymentAccount;

  OrderBuilder() {
    Order._defaults(this);
  }

  OrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _branchName = $v.branchName;
      _packageId = $v.packageId;
      _packageName = $v.packageName;
      _priceRp = $v.priceRp;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _status = $v.status;
      _submittedAt = $v.submittedAt;
      _expiresAt = $v.expiresAt;
      _continuationSlotId = $v.continuationSlotId;
      _paymentProofId = $v.paymentProofId;
      _decisionReasonCode = $v.decisionReasonCode;
      _version = $v.version;
      _paymentAccount = $v.paymentAccount?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Order other) {
    _$v = other as _$Order;
  }

  @override
  void update(void Function(OrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Order build() => _build();

  _$Order _build() {
    _$Order _$result;
    try {
      _$result =
          _$v ??
          _$Order._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Order', 'id'),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'Order',
              'branchId',
            ),
            branchName: branchName,
            packageId: BuiltValueNullFieldError.checkNotNull(
              packageId,
              r'Order',
              'packageId',
            ),
            packageName: BuiltValueNullFieldError.checkNotNull(
              packageName,
              r'Order',
              'packageName',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'Order',
              'priceRp',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'Order',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'Order',
              'durationDays',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'Order',
              'status',
            ),
            submittedAt: BuiltValueNullFieldError.checkNotNull(
              submittedAt,
              r'Order',
              'submittedAt',
            ),
            expiresAt: expiresAt,
            continuationSlotId: continuationSlotId,
            paymentProofId: paymentProofId,
            decisionReasonCode: decisionReasonCode,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'Order',
              'version',
            ),
            paymentAccount: _paymentAccount?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'paymentAccount';
        _paymentAccount?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Order', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
