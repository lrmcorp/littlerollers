// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_activation_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentActivationResultStatusEnum
_$paymentActivationResultStatusEnum_ACTIVE =
    const PaymentActivationResultStatusEnum._('ACTIVE');
const PaymentActivationResultStatusEnum
_$paymentActivationResultStatusEnum_EXPIRED =
    const PaymentActivationResultStatusEnum._('EXPIRED');
const PaymentActivationResultStatusEnum
_$paymentActivationResultStatusEnum_INACTIVE =
    const PaymentActivationResultStatusEnum._('INACTIVE');

PaymentActivationResultStatusEnum _$paymentActivationResultStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$paymentActivationResultStatusEnum_ACTIVE;
    case 'EXPIRED':
      return _$paymentActivationResultStatusEnum_EXPIRED;
    case 'INACTIVE':
      return _$paymentActivationResultStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentActivationResultStatusEnum>
_$paymentActivationResultStatusEnumValues =
    BuiltSet<PaymentActivationResultStatusEnum>(
      const <PaymentActivationResultStatusEnum>[
        _$paymentActivationResultStatusEnum_ACTIVE,
        _$paymentActivationResultStatusEnum_EXPIRED,
        _$paymentActivationResultStatusEnum_INACTIVE,
      ],
    );

Serializer<PaymentActivationResultStatusEnum>
_$paymentActivationResultStatusEnumSerializer =
    _$PaymentActivationResultStatusEnumSerializer();

class _$PaymentActivationResultStatusEnumSerializer
    implements PrimitiveSerializer<PaymentActivationResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[PaymentActivationResultStatusEnum];
  @override
  final String wireName = 'PaymentActivationResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentActivationResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentActivationResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentActivationResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentActivationResult extends PaymentActivationResult {
  @override
  final String customerPackageId;
  @override
  final String packageId;
  @override
  final String packageName;
  @override
  final PaymentActivationResultStatusEnum status;
  @override
  final int sessionCount;
  @override
  final Date activationDate;
  @override
  final DateTime expiryAt;
  @override
  final String? ledgerEntryId;
  @override
  final int? ledgerQuantity;
  @override
  final DateTime? ledgerOccurredAt;

  factory _$PaymentActivationResult([
    void Function(PaymentActivationResultBuilder)? updates,
  ]) => (PaymentActivationResultBuilder()..update(updates))._build();

  _$PaymentActivationResult._({
    required this.customerPackageId,
    required this.packageId,
    required this.packageName,
    required this.status,
    required this.sessionCount,
    required this.activationDate,
    required this.expiryAt,
    this.ledgerEntryId,
    this.ledgerQuantity,
    this.ledgerOccurredAt,
  }) : super._();
  @override
  PaymentActivationResult rebuild(
    void Function(PaymentActivationResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentActivationResultBuilder toBuilder() =>
      PaymentActivationResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentActivationResult &&
        customerPackageId == other.customerPackageId &&
        packageId == other.packageId &&
        packageName == other.packageName &&
        status == other.status &&
        sessionCount == other.sessionCount &&
        activationDate == other.activationDate &&
        expiryAt == other.expiryAt &&
        ledgerEntryId == other.ledgerEntryId &&
        ledgerQuantity == other.ledgerQuantity &&
        ledgerOccurredAt == other.ledgerOccurredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, packageName.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, activationDate.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jc(_$hash, ledgerEntryId.hashCode);
    _$hash = $jc(_$hash, ledgerQuantity.hashCode);
    _$hash = $jc(_$hash, ledgerOccurredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentActivationResult')
          ..add('customerPackageId', customerPackageId)
          ..add('packageId', packageId)
          ..add('packageName', packageName)
          ..add('status', status)
          ..add('sessionCount', sessionCount)
          ..add('activationDate', activationDate)
          ..add('expiryAt', expiryAt)
          ..add('ledgerEntryId', ledgerEntryId)
          ..add('ledgerQuantity', ledgerQuantity)
          ..add('ledgerOccurredAt', ledgerOccurredAt))
        .toString();
  }
}

class PaymentActivationResultBuilder
    implements
        Builder<PaymentActivationResult, PaymentActivationResultBuilder> {
  _$PaymentActivationResult? _$v;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _packageName;
  String? get packageName => _$this._packageName;
  set packageName(String? packageName) => _$this._packageName = packageName;

  PaymentActivationResultStatusEnum? _status;
  PaymentActivationResultStatusEnum? get status => _$this._status;
  set status(PaymentActivationResultStatusEnum? status) =>
      _$this._status = status;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  Date? _activationDate;
  Date? get activationDate => _$this._activationDate;
  set activationDate(Date? activationDate) =>
      _$this._activationDate = activationDate;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  String? _ledgerEntryId;
  String? get ledgerEntryId => _$this._ledgerEntryId;
  set ledgerEntryId(String? ledgerEntryId) =>
      _$this._ledgerEntryId = ledgerEntryId;

  int? _ledgerQuantity;
  int? get ledgerQuantity => _$this._ledgerQuantity;
  set ledgerQuantity(int? ledgerQuantity) =>
      _$this._ledgerQuantity = ledgerQuantity;

  DateTime? _ledgerOccurredAt;
  DateTime? get ledgerOccurredAt => _$this._ledgerOccurredAt;
  set ledgerOccurredAt(DateTime? ledgerOccurredAt) =>
      _$this._ledgerOccurredAt = ledgerOccurredAt;

  PaymentActivationResultBuilder() {
    PaymentActivationResult._defaults(this);
  }

  PaymentActivationResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customerPackageId = $v.customerPackageId;
      _packageId = $v.packageId;
      _packageName = $v.packageName;
      _status = $v.status;
      _sessionCount = $v.sessionCount;
      _activationDate = $v.activationDate;
      _expiryAt = $v.expiryAt;
      _ledgerEntryId = $v.ledgerEntryId;
      _ledgerQuantity = $v.ledgerQuantity;
      _ledgerOccurredAt = $v.ledgerOccurredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentActivationResult other) {
    _$v = other as _$PaymentActivationResult;
  }

  @override
  void update(void Function(PaymentActivationResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentActivationResult build() => _build();

  _$PaymentActivationResult _build() {
    final _$result =
        _$v ??
        _$PaymentActivationResult._(
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'PaymentActivationResult',
            'customerPackageId',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'PaymentActivationResult',
            'packageId',
          ),
          packageName: BuiltValueNullFieldError.checkNotNull(
            packageName,
            r'PaymentActivationResult',
            'packageName',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'PaymentActivationResult',
            'status',
          ),
          sessionCount: BuiltValueNullFieldError.checkNotNull(
            sessionCount,
            r'PaymentActivationResult',
            'sessionCount',
          ),
          activationDate: BuiltValueNullFieldError.checkNotNull(
            activationDate,
            r'PaymentActivationResult',
            'activationDate',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'PaymentActivationResult',
            'expiryAt',
          ),
          ledgerEntryId: ledgerEntryId,
          ledgerQuantity: ledgerQuantity,
          ledgerOccurredAt: ledgerOccurredAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
