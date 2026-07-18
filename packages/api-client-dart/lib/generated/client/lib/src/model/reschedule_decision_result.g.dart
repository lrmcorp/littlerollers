// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule_decision_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RescheduleDecisionResult extends RescheduleDecisionResult {
  @override
  final Reschedule reschedule;
  @override
  final Booking booking;
  @override
  final bool idempotentReplay;

  factory _$RescheduleDecisionResult([
    void Function(RescheduleDecisionResultBuilder)? updates,
  ]) => (RescheduleDecisionResultBuilder()..update(updates))._build();

  _$RescheduleDecisionResult._({
    required this.reschedule,
    required this.booking,
    required this.idempotentReplay,
  }) : super._();
  @override
  RescheduleDecisionResult rebuild(
    void Function(RescheduleDecisionResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RescheduleDecisionResultBuilder toBuilder() =>
      RescheduleDecisionResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RescheduleDecisionResult &&
        reschedule == other.reschedule &&
        booking == other.booking &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reschedule.hashCode);
    _$hash = $jc(_$hash, booking.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RescheduleDecisionResult')
          ..add('reschedule', reschedule)
          ..add('booking', booking)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class RescheduleDecisionResultBuilder
    implements
        Builder<RescheduleDecisionResult, RescheduleDecisionResultBuilder> {
  _$RescheduleDecisionResult? _$v;

  RescheduleBuilder? _reschedule;
  RescheduleBuilder get reschedule =>
      _$this._reschedule ??= RescheduleBuilder();
  set reschedule(RescheduleBuilder? reschedule) =>
      _$this._reschedule = reschedule;

  BookingBuilder? _booking;
  BookingBuilder get booking => _$this._booking ??= BookingBuilder();
  set booking(BookingBuilder? booking) => _$this._booking = booking;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  RescheduleDecisionResultBuilder() {
    RescheduleDecisionResult._defaults(this);
  }

  RescheduleDecisionResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reschedule = $v.reschedule.toBuilder();
      _booking = $v.booking.toBuilder();
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RescheduleDecisionResult other) {
    _$v = other as _$RescheduleDecisionResult;
  }

  @override
  void update(void Function(RescheduleDecisionResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RescheduleDecisionResult build() => _build();

  _$RescheduleDecisionResult _build() {
    _$RescheduleDecisionResult _$result;
    try {
      _$result =
          _$v ??
          _$RescheduleDecisionResult._(
            reschedule: reschedule.build(),
            booking: booking.build(),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'RescheduleDecisionResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'reschedule';
        reschedule.build();
        _$failedField = 'booking';
        booking.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'RescheduleDecisionResult',
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
