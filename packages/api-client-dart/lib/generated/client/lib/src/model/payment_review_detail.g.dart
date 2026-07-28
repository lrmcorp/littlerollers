// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentReviewDetail extends PaymentReviewDetail {
  @override
  final PaymentReviewItem purchase;
  @override
  final PaymentReviewTimeline timeline;
  @override
  final String? decisionActorMasked;
  @override
  final PaymentActivationResult? activation;
  @override
  final PaymentActivationSummary? balance;
  @override
  final PaymentUsageHistoryPage usageHistory;

  factory _$PaymentReviewDetail([
    void Function(PaymentReviewDetailBuilder)? updates,
  ]) => (PaymentReviewDetailBuilder()..update(updates))._build();

  _$PaymentReviewDetail._({
    required this.purchase,
    required this.timeline,
    this.decisionActorMasked,
    this.activation,
    this.balance,
    required this.usageHistory,
  }) : super._();
  @override
  PaymentReviewDetail rebuild(
    void Function(PaymentReviewDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentReviewDetailBuilder toBuilder() =>
      PaymentReviewDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewDetail &&
        purchase == other.purchase &&
        timeline == other.timeline &&
        decisionActorMasked == other.decisionActorMasked &&
        activation == other.activation &&
        balance == other.balance &&
        usageHistory == other.usageHistory;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, purchase.hashCode);
    _$hash = $jc(_$hash, timeline.hashCode);
    _$hash = $jc(_$hash, decisionActorMasked.hashCode);
    _$hash = $jc(_$hash, activation.hashCode);
    _$hash = $jc(_$hash, balance.hashCode);
    _$hash = $jc(_$hash, usageHistory.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentReviewDetail')
          ..add('purchase', purchase)
          ..add('timeline', timeline)
          ..add('decisionActorMasked', decisionActorMasked)
          ..add('activation', activation)
          ..add('balance', balance)
          ..add('usageHistory', usageHistory))
        .toString();
  }
}

class PaymentReviewDetailBuilder
    implements Builder<PaymentReviewDetail, PaymentReviewDetailBuilder> {
  _$PaymentReviewDetail? _$v;

  PaymentReviewItemBuilder? _purchase;
  PaymentReviewItemBuilder get purchase =>
      _$this._purchase ??= PaymentReviewItemBuilder();
  set purchase(PaymentReviewItemBuilder? purchase) =>
      _$this._purchase = purchase;

  PaymentReviewTimelineBuilder? _timeline;
  PaymentReviewTimelineBuilder get timeline =>
      _$this._timeline ??= PaymentReviewTimelineBuilder();
  set timeline(PaymentReviewTimelineBuilder? timeline) =>
      _$this._timeline = timeline;

  String? _decisionActorMasked;
  String? get decisionActorMasked => _$this._decisionActorMasked;
  set decisionActorMasked(String? decisionActorMasked) =>
      _$this._decisionActorMasked = decisionActorMasked;

  PaymentActivationResultBuilder? _activation;
  PaymentActivationResultBuilder get activation =>
      _$this._activation ??= PaymentActivationResultBuilder();
  set activation(PaymentActivationResultBuilder? activation) =>
      _$this._activation = activation;

  PaymentActivationSummaryBuilder? _balance;
  PaymentActivationSummaryBuilder get balance =>
      _$this._balance ??= PaymentActivationSummaryBuilder();
  set balance(PaymentActivationSummaryBuilder? balance) =>
      _$this._balance = balance;

  PaymentUsageHistoryPageBuilder? _usageHistory;
  PaymentUsageHistoryPageBuilder get usageHistory =>
      _$this._usageHistory ??= PaymentUsageHistoryPageBuilder();
  set usageHistory(PaymentUsageHistoryPageBuilder? usageHistory) =>
      _$this._usageHistory = usageHistory;

  PaymentReviewDetailBuilder() {
    PaymentReviewDetail._defaults(this);
  }

  PaymentReviewDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purchase = $v.purchase.toBuilder();
      _timeline = $v.timeline.toBuilder();
      _decisionActorMasked = $v.decisionActorMasked;
      _activation = $v.activation?.toBuilder();
      _balance = $v.balance?.toBuilder();
      _usageHistory = $v.usageHistory.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentReviewDetail other) {
    _$v = other as _$PaymentReviewDetail;
  }

  @override
  void update(void Function(PaymentReviewDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewDetail build() => _build();

  _$PaymentReviewDetail _build() {
    _$PaymentReviewDetail _$result;
    try {
      _$result =
          _$v ??
          _$PaymentReviewDetail._(
            purchase: purchase.build(),
            timeline: timeline.build(),
            decisionActorMasked: decisionActorMasked,
            activation: _activation?.build(),
            balance: _balance?.build(),
            usageHistory: usageHistory.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'purchase';
        purchase.build();
        _$failedField = 'timeline';
        timeline.build();

        _$failedField = 'activation';
        _activation?.build();
        _$failedField = 'balance';
        _balance?.build();
        _$failedField = 'usageHistory';
        usageHistory.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PaymentReviewDetail',
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
