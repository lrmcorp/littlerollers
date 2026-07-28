// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order_activation.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerOrderActivation extends CustomerOrderActivation {
  @override
  final String customerPackageId;
  @override
  final String status;
  @override
  final DateTime activationDate;
  @override
  final DateTime expiryAt;
  @override
  final int sessionCount;

  factory _$CustomerOrderActivation([
    void Function(CustomerOrderActivationBuilder)? updates,
  ]) => (CustomerOrderActivationBuilder()..update(updates))._build();

  _$CustomerOrderActivation._({
    required this.customerPackageId,
    required this.status,
    required this.activationDate,
    required this.expiryAt,
    required this.sessionCount,
  }) : super._();
  @override
  CustomerOrderActivation rebuild(
    void Function(CustomerOrderActivationBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerOrderActivationBuilder toBuilder() =>
      CustomerOrderActivationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrderActivation &&
        customerPackageId == other.customerPackageId &&
        status == other.status &&
        activationDate == other.activationDate &&
        expiryAt == other.expiryAt &&
        sessionCount == other.sessionCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, activationDate.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerOrderActivation')
          ..add('customerPackageId', customerPackageId)
          ..add('status', status)
          ..add('activationDate', activationDate)
          ..add('expiryAt', expiryAt)
          ..add('sessionCount', sessionCount))
        .toString();
  }
}

class CustomerOrderActivationBuilder
    implements
        Builder<CustomerOrderActivation, CustomerOrderActivationBuilder> {
  _$CustomerOrderActivation? _$v;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _activationDate;
  DateTime? get activationDate => _$this._activationDate;
  set activationDate(DateTime? activationDate) =>
      _$this._activationDate = activationDate;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  CustomerOrderActivationBuilder() {
    CustomerOrderActivation._defaults(this);
  }

  CustomerOrderActivationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customerPackageId = $v.customerPackageId;
      _status = $v.status;
      _activationDate = $v.activationDate;
      _expiryAt = $v.expiryAt;
      _sessionCount = $v.sessionCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrderActivation other) {
    _$v = other as _$CustomerOrderActivation;
  }

  @override
  void update(void Function(CustomerOrderActivationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrderActivation build() => _build();

  _$CustomerOrderActivation _build() {
    final _$result =
        _$v ??
        _$CustomerOrderActivation._(
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'CustomerOrderActivation',
            'customerPackageId',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerOrderActivation',
            'status',
          ),
          activationDate: BuiltValueNullFieldError.checkNotNull(
            activationDate,
            r'CustomerOrderActivation',
            'activationDate',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'CustomerOrderActivation',
            'expiryAt',
          ),
          sessionCount: BuiltValueNullFieldError.checkNotNull(
            sessionCount,
            r'CustomerOrderActivation',
            'sessionCount',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
