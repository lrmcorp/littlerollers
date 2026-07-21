// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reservation_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReservationSummary extends ReservationSummary {
  @override
  final int activeQuantity;

  factory _$ReservationSummary([
    void Function(ReservationSummaryBuilder)? updates,
  ]) => (ReservationSummaryBuilder()..update(updates))._build();

  _$ReservationSummary._({required this.activeQuantity}) : super._();
  @override
  ReservationSummary rebuild(
    void Function(ReservationSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReservationSummaryBuilder toBuilder() =>
      ReservationSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReservationSummary &&
        activeQuantity == other.activeQuantity;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, activeQuantity.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'ReservationSummary',
    )..add('activeQuantity', activeQuantity)).toString();
  }
}

class ReservationSummaryBuilder
    implements Builder<ReservationSummary, ReservationSummaryBuilder> {
  _$ReservationSummary? _$v;

  int? _activeQuantity;
  int? get activeQuantity => _$this._activeQuantity;
  set activeQuantity(int? activeQuantity) =>
      _$this._activeQuantity = activeQuantity;

  ReservationSummaryBuilder() {
    ReservationSummary._defaults(this);
  }

  ReservationSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _activeQuantity = $v.activeQuantity;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReservationSummary other) {
    _$v = other as _$ReservationSummary;
  }

  @override
  void update(void Function(ReservationSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReservationSummary build() => _build();

  _$ReservationSummary _build() {
    final _$result =
        _$v ??
        _$ReservationSummary._(
          activeQuantity: BuiltValueNullFieldError.checkNotNull(
            activeQuantity,
            r'ReservationSummary',
            'activeQuantity',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
