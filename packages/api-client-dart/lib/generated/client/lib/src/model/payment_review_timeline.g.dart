// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_timeline.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentReviewTimeline extends PaymentReviewTimeline {
  @override
  final DateTime submittedAt;
  @override
  final DateTime? proofFinalizedAt;
  @override
  final DateTime? decidedAt;

  factory _$PaymentReviewTimeline([
    void Function(PaymentReviewTimelineBuilder)? updates,
  ]) => (PaymentReviewTimelineBuilder()..update(updates))._build();

  _$PaymentReviewTimeline._({
    required this.submittedAt,
    this.proofFinalizedAt,
    this.decidedAt,
  }) : super._();
  @override
  PaymentReviewTimeline rebuild(
    void Function(PaymentReviewTimelineBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentReviewTimelineBuilder toBuilder() =>
      PaymentReviewTimelineBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewTimeline &&
        submittedAt == other.submittedAt &&
        proofFinalizedAt == other.proofFinalizedAt &&
        decidedAt == other.decidedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jc(_$hash, proofFinalizedAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentReviewTimeline')
          ..add('submittedAt', submittedAt)
          ..add('proofFinalizedAt', proofFinalizedAt)
          ..add('decidedAt', decidedAt))
        .toString();
  }
}

class PaymentReviewTimelineBuilder
    implements Builder<PaymentReviewTimeline, PaymentReviewTimelineBuilder> {
  _$PaymentReviewTimeline? _$v;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(DateTime? submittedAt) => _$this._submittedAt = submittedAt;

  DateTime? _proofFinalizedAt;
  DateTime? get proofFinalizedAt => _$this._proofFinalizedAt;
  set proofFinalizedAt(DateTime? proofFinalizedAt) =>
      _$this._proofFinalizedAt = proofFinalizedAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  PaymentReviewTimelineBuilder() {
    PaymentReviewTimeline._defaults(this);
  }

  PaymentReviewTimelineBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _submittedAt = $v.submittedAt;
      _proofFinalizedAt = $v.proofFinalizedAt;
      _decidedAt = $v.decidedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentReviewTimeline other) {
    _$v = other as _$PaymentReviewTimeline;
  }

  @override
  void update(void Function(PaymentReviewTimelineBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewTimeline build() => _build();

  _$PaymentReviewTimeline _build() {
    final _$result =
        _$v ??
        _$PaymentReviewTimeline._(
          submittedAt: BuiltValueNullFieldError.checkNotNull(
            submittedAt,
            r'PaymentReviewTimeline',
            'submittedAt',
          ),
          proofFinalizedAt: proofFinalizedAt,
          decidedAt: decidedAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
