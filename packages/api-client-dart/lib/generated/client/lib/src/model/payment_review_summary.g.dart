// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentReviewSummary extends PaymentReviewSummary {
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
  @override
  final int totalAmountRp;
  @override
  final int agingOver24Hours;

  factory _$PaymentReviewSummary([
    void Function(PaymentReviewSummaryBuilder)? updates,
  ]) => (PaymentReviewSummaryBuilder()..update(updates))._build();

  _$PaymentReviewSummary._({
    required this.pending,
    required this.actionRequired,
    required this.approved,
    required this.rejected,
    required this.expired,
    required this.totalAmountRp,
    required this.agingOver24Hours,
  }) : super._();
  @override
  PaymentReviewSummary rebuild(
    void Function(PaymentReviewSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentReviewSummaryBuilder toBuilder() =>
      PaymentReviewSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewSummary &&
        pending == other.pending &&
        actionRequired == other.actionRequired &&
        approved == other.approved &&
        rejected == other.rejected &&
        expired == other.expired &&
        totalAmountRp == other.totalAmountRp &&
        agingOver24Hours == other.agingOver24Hours;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, pending.hashCode);
    _$hash = $jc(_$hash, actionRequired.hashCode);
    _$hash = $jc(_$hash, approved.hashCode);
    _$hash = $jc(_$hash, rejected.hashCode);
    _$hash = $jc(_$hash, expired.hashCode);
    _$hash = $jc(_$hash, totalAmountRp.hashCode);
    _$hash = $jc(_$hash, agingOver24Hours.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentReviewSummary')
          ..add('pending', pending)
          ..add('actionRequired', actionRequired)
          ..add('approved', approved)
          ..add('rejected', rejected)
          ..add('expired', expired)
          ..add('totalAmountRp', totalAmountRp)
          ..add('agingOver24Hours', agingOver24Hours))
        .toString();
  }
}

class PaymentReviewSummaryBuilder
    implements Builder<PaymentReviewSummary, PaymentReviewSummaryBuilder> {
  _$PaymentReviewSummary? _$v;

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

  int? _totalAmountRp;
  int? get totalAmountRp => _$this._totalAmountRp;
  set totalAmountRp(int? totalAmountRp) =>
      _$this._totalAmountRp = totalAmountRp;

  int? _agingOver24Hours;
  int? get agingOver24Hours => _$this._agingOver24Hours;
  set agingOver24Hours(int? agingOver24Hours) =>
      _$this._agingOver24Hours = agingOver24Hours;

  PaymentReviewSummaryBuilder() {
    PaymentReviewSummary._defaults(this);
  }

  PaymentReviewSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _pending = $v.pending;
      _actionRequired = $v.actionRequired;
      _approved = $v.approved;
      _rejected = $v.rejected;
      _expired = $v.expired;
      _totalAmountRp = $v.totalAmountRp;
      _agingOver24Hours = $v.agingOver24Hours;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentReviewSummary other) {
    _$v = other as _$PaymentReviewSummary;
  }

  @override
  void update(void Function(PaymentReviewSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewSummary build() => _build();

  _$PaymentReviewSummary _build() {
    final _$result =
        _$v ??
        _$PaymentReviewSummary._(
          pending: BuiltValueNullFieldError.checkNotNull(
            pending,
            r'PaymentReviewSummary',
            'pending',
          ),
          actionRequired: BuiltValueNullFieldError.checkNotNull(
            actionRequired,
            r'PaymentReviewSummary',
            'actionRequired',
          ),
          approved: BuiltValueNullFieldError.checkNotNull(
            approved,
            r'PaymentReviewSummary',
            'approved',
          ),
          rejected: BuiltValueNullFieldError.checkNotNull(
            rejected,
            r'PaymentReviewSummary',
            'rejected',
          ),
          expired: BuiltValueNullFieldError.checkNotNull(
            expired,
            r'PaymentReviewSummary',
            'expired',
          ),
          totalAmountRp: BuiltValueNullFieldError.checkNotNull(
            totalAmountRp,
            r'PaymentReviewSummary',
            'totalAmountRp',
          ),
          agingOver24Hours: BuiltValueNullFieldError.checkNotNull(
            agingOver24Hours,
            r'PaymentReviewSummary',
            'agingOver24Hours',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
