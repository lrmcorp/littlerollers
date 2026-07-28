// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_activation_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentActivationSummaryStatusEnum
_$paymentActivationSummaryStatusEnum_ACTIVE =
    const PaymentActivationSummaryStatusEnum._('ACTIVE');
const PaymentActivationSummaryStatusEnum
_$paymentActivationSummaryStatusEnum_EXPIRED =
    const PaymentActivationSummaryStatusEnum._('EXPIRED');
const PaymentActivationSummaryStatusEnum
_$paymentActivationSummaryStatusEnum_INACTIVE =
    const PaymentActivationSummaryStatusEnum._('INACTIVE');

PaymentActivationSummaryStatusEnum _$paymentActivationSummaryStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$paymentActivationSummaryStatusEnum_ACTIVE;
    case 'EXPIRED':
      return _$paymentActivationSummaryStatusEnum_EXPIRED;
    case 'INACTIVE':
      return _$paymentActivationSummaryStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentActivationSummaryStatusEnum>
_$paymentActivationSummaryStatusEnumValues =
    BuiltSet<PaymentActivationSummaryStatusEnum>(
      const <PaymentActivationSummaryStatusEnum>[
        _$paymentActivationSummaryStatusEnum_ACTIVE,
        _$paymentActivationSummaryStatusEnum_EXPIRED,
        _$paymentActivationSummaryStatusEnum_INACTIVE,
      ],
    );

Serializer<PaymentActivationSummaryStatusEnum>
_$paymentActivationSummaryStatusEnumSerializer =
    _$PaymentActivationSummaryStatusEnumSerializer();

class _$PaymentActivationSummaryStatusEnumSerializer
    implements PrimitiveSerializer<PaymentActivationSummaryStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentActivationSummaryStatusEnum];
  @override
  final String wireName = 'PaymentActivationSummaryStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentActivationSummaryStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentActivationSummaryStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentActivationSummaryStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentActivationSummary extends PaymentActivationSummary {
  @override
  final String customerPackageId;
  @override
  final PaymentActivationSummaryStatusEnum status;
  @override
  final Date activationDate;
  @override
  final DateTime expiryAt;
  @override
  final int sessionCount;
  @override
  final int ledgerBalance;
  @override
  final int reserved;
  @override
  final int available;
  @override
  final int used;

  factory _$PaymentActivationSummary([
    void Function(PaymentActivationSummaryBuilder)? updates,
  ]) => (PaymentActivationSummaryBuilder()..update(updates))._build();

  _$PaymentActivationSummary._({
    required this.customerPackageId,
    required this.status,
    required this.activationDate,
    required this.expiryAt,
    required this.sessionCount,
    required this.ledgerBalance,
    required this.reserved,
    required this.available,
    required this.used,
  }) : super._();
  @override
  PaymentActivationSummary rebuild(
    void Function(PaymentActivationSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentActivationSummaryBuilder toBuilder() =>
      PaymentActivationSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentActivationSummary &&
        customerPackageId == other.customerPackageId &&
        status == other.status &&
        activationDate == other.activationDate &&
        expiryAt == other.expiryAt &&
        sessionCount == other.sessionCount &&
        ledgerBalance == other.ledgerBalance &&
        reserved == other.reserved &&
        available == other.available &&
        used == other.used;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, activationDate.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, ledgerBalance.hashCode);
    _$hash = $jc(_$hash, reserved.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, used.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentActivationSummary')
          ..add('customerPackageId', customerPackageId)
          ..add('status', status)
          ..add('activationDate', activationDate)
          ..add('expiryAt', expiryAt)
          ..add('sessionCount', sessionCount)
          ..add('ledgerBalance', ledgerBalance)
          ..add('reserved', reserved)
          ..add('available', available)
          ..add('used', used))
        .toString();
  }
}

class PaymentActivationSummaryBuilder
    implements
        Builder<PaymentActivationSummary, PaymentActivationSummaryBuilder> {
  _$PaymentActivationSummary? _$v;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  PaymentActivationSummaryStatusEnum? _status;
  PaymentActivationSummaryStatusEnum? get status => _$this._status;
  set status(PaymentActivationSummaryStatusEnum? status) =>
      _$this._status = status;

  Date? _activationDate;
  Date? get activationDate => _$this._activationDate;
  set activationDate(Date? activationDate) =>
      _$this._activationDate = activationDate;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  int? _ledgerBalance;
  int? get ledgerBalance => _$this._ledgerBalance;
  set ledgerBalance(int? ledgerBalance) =>
      _$this._ledgerBalance = ledgerBalance;

  int? _reserved;
  int? get reserved => _$this._reserved;
  set reserved(int? reserved) => _$this._reserved = reserved;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  int? _used;
  int? get used => _$this._used;
  set used(int? used) => _$this._used = used;

  PaymentActivationSummaryBuilder() {
    PaymentActivationSummary._defaults(this);
  }

  PaymentActivationSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customerPackageId = $v.customerPackageId;
      _status = $v.status;
      _activationDate = $v.activationDate;
      _expiryAt = $v.expiryAt;
      _sessionCount = $v.sessionCount;
      _ledgerBalance = $v.ledgerBalance;
      _reserved = $v.reserved;
      _available = $v.available;
      _used = $v.used;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentActivationSummary other) {
    _$v = other as _$PaymentActivationSummary;
  }

  @override
  void update(void Function(PaymentActivationSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentActivationSummary build() => _build();

  _$PaymentActivationSummary _build() {
    final _$result =
        _$v ??
        _$PaymentActivationSummary._(
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'PaymentActivationSummary',
            'customerPackageId',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'PaymentActivationSummary',
            'status',
          ),
          activationDate: BuiltValueNullFieldError.checkNotNull(
            activationDate,
            r'PaymentActivationSummary',
            'activationDate',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'PaymentActivationSummary',
            'expiryAt',
          ),
          sessionCount: BuiltValueNullFieldError.checkNotNull(
            sessionCount,
            r'PaymentActivationSummary',
            'sessionCount',
          ),
          ledgerBalance: BuiltValueNullFieldError.checkNotNull(
            ledgerBalance,
            r'PaymentActivationSummary',
            'ledgerBalance',
          ),
          reserved: BuiltValueNullFieldError.checkNotNull(
            reserved,
            r'PaymentActivationSummary',
            'reserved',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'PaymentActivationSummary',
            'available',
          ),
          used: BuiltValueNullFieldError.checkNotNull(
            used,
            r'PaymentActivationSummary',
            'used',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
