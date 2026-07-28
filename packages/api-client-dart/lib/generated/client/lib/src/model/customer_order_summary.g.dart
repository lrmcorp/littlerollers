// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerOrderSummary extends CustomerOrderSummary {
  @override
  final int total;
  @override
  final int awaitingPayment;
  @override
  final int pending;
  @override
  final int actionRequired;
  @override
  final int approved;
  @override
  final int rejected;
  @override
  final int expired;

  factory _$CustomerOrderSummary([
    void Function(CustomerOrderSummaryBuilder)? updates,
  ]) => (CustomerOrderSummaryBuilder()..update(updates))._build();

  _$CustomerOrderSummary._({
    required this.total,
    required this.awaitingPayment,
    required this.pending,
    required this.actionRequired,
    required this.approved,
    required this.rejected,
    required this.expired,
  }) : super._();
  @override
  CustomerOrderSummary rebuild(
    void Function(CustomerOrderSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerOrderSummaryBuilder toBuilder() =>
      CustomerOrderSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrderSummary &&
        total == other.total &&
        awaitingPayment == other.awaitingPayment &&
        pending == other.pending &&
        actionRequired == other.actionRequired &&
        approved == other.approved &&
        rejected == other.rejected &&
        expired == other.expired;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, awaitingPayment.hashCode);
    _$hash = $jc(_$hash, pending.hashCode);
    _$hash = $jc(_$hash, actionRequired.hashCode);
    _$hash = $jc(_$hash, approved.hashCode);
    _$hash = $jc(_$hash, rejected.hashCode);
    _$hash = $jc(_$hash, expired.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerOrderSummary')
          ..add('total', total)
          ..add('awaitingPayment', awaitingPayment)
          ..add('pending', pending)
          ..add('actionRequired', actionRequired)
          ..add('approved', approved)
          ..add('rejected', rejected)
          ..add('expired', expired))
        .toString();
  }
}

class CustomerOrderSummaryBuilder
    implements Builder<CustomerOrderSummary, CustomerOrderSummaryBuilder> {
  _$CustomerOrderSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _awaitingPayment;
  int? get awaitingPayment => _$this._awaitingPayment;
  set awaitingPayment(int? awaitingPayment) =>
      _$this._awaitingPayment = awaitingPayment;

  int? _pending;
  int? get pending => _$this._pending;
  set pending(int? pending) => _$this._pending = pending;

  int? _actionRequired;
  int? get actionRequired => _$this._actionRequired;
  set actionRequired(int? actionRequired) =>
      _$this._actionRequired = actionRequired;

  int? _approved;
  int? get approved => _$this._approved;
  set approved(int? approved) => _$this._approved = approved;

  int? _rejected;
  int? get rejected => _$this._rejected;
  set rejected(int? rejected) => _$this._rejected = rejected;

  int? _expired;
  int? get expired => _$this._expired;
  set expired(int? expired) => _$this._expired = expired;

  CustomerOrderSummaryBuilder() {
    CustomerOrderSummary._defaults(this);
  }

  CustomerOrderSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _awaitingPayment = $v.awaitingPayment;
      _pending = $v.pending;
      _actionRequired = $v.actionRequired;
      _approved = $v.approved;
      _rejected = $v.rejected;
      _expired = $v.expired;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrderSummary other) {
    _$v = other as _$CustomerOrderSummary;
  }

  @override
  void update(void Function(CustomerOrderSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrderSummary build() => _build();

  _$CustomerOrderSummary _build() {
    final _$result =
        _$v ??
        _$CustomerOrderSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'CustomerOrderSummary',
            'total',
          ),
          awaitingPayment: BuiltValueNullFieldError.checkNotNull(
            awaitingPayment,
            r'CustomerOrderSummary',
            'awaitingPayment',
          ),
          pending: BuiltValueNullFieldError.checkNotNull(
            pending,
            r'CustomerOrderSummary',
            'pending',
          ),
          actionRequired: BuiltValueNullFieldError.checkNotNull(
            actionRequired,
            r'CustomerOrderSummary',
            'actionRequired',
          ),
          approved: BuiltValueNullFieldError.checkNotNull(
            approved,
            r'CustomerOrderSummary',
            'approved',
          ),
          rejected: BuiltValueNullFieldError.checkNotNull(
            rejected,
            r'CustomerOrderSummary',
            'rejected',
          ),
          expired: BuiltValueNullFieldError.checkNotNull(
            expired,
            r'CustomerOrderSummary',
            'expired',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
