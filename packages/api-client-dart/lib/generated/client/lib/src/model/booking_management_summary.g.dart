// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_management_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingManagementSummary extends BookingManagementSummary {
  @override
  final int total;
  @override
  final int booked;
  @override
  final int reschedulePending;
  @override
  final int attended;
  @override
  final int cancelled;
  @override
  final int noShow;

  factory _$BookingManagementSummary([
    void Function(BookingManagementSummaryBuilder)? updates,
  ]) => (BookingManagementSummaryBuilder()..update(updates))._build();

  _$BookingManagementSummary._({
    required this.total,
    required this.booked,
    required this.reschedulePending,
    required this.attended,
    required this.cancelled,
    required this.noShow,
  }) : super._();
  @override
  BookingManagementSummary rebuild(
    void Function(BookingManagementSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BookingManagementSummaryBuilder toBuilder() =>
      BookingManagementSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingManagementSummary &&
        total == other.total &&
        booked == other.booked &&
        reschedulePending == other.reschedulePending &&
        attended == other.attended &&
        cancelled == other.cancelled &&
        noShow == other.noShow;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, booked.hashCode);
    _$hash = $jc(_$hash, reschedulePending.hashCode);
    _$hash = $jc(_$hash, attended.hashCode);
    _$hash = $jc(_$hash, cancelled.hashCode);
    _$hash = $jc(_$hash, noShow.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingManagementSummary')
          ..add('total', total)
          ..add('booked', booked)
          ..add('reschedulePending', reschedulePending)
          ..add('attended', attended)
          ..add('cancelled', cancelled)
          ..add('noShow', noShow))
        .toString();
  }
}

class BookingManagementSummaryBuilder
    implements
        Builder<BookingManagementSummary, BookingManagementSummaryBuilder> {
  _$BookingManagementSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _booked;
  int? get booked => _$this._booked;
  set booked(int? booked) => _$this._booked = booked;

  int? _reschedulePending;
  int? get reschedulePending => _$this._reschedulePending;
  set reschedulePending(int? reschedulePending) =>
      _$this._reschedulePending = reschedulePending;

  int? _attended;
  int? get attended => _$this._attended;
  set attended(int? attended) => _$this._attended = attended;

  int? _cancelled;
  int? get cancelled => _$this._cancelled;
  set cancelled(int? cancelled) => _$this._cancelled = cancelled;

  int? _noShow;
  int? get noShow => _$this._noShow;
  set noShow(int? noShow) => _$this._noShow = noShow;

  BookingManagementSummaryBuilder() {
    BookingManagementSummary._defaults(this);
  }

  BookingManagementSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _booked = $v.booked;
      _reschedulePending = $v.reschedulePending;
      _attended = $v.attended;
      _cancelled = $v.cancelled;
      _noShow = $v.noShow;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingManagementSummary other) {
    _$v = other as _$BookingManagementSummary;
  }

  @override
  void update(void Function(BookingManagementSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingManagementSummary build() => _build();

  _$BookingManagementSummary _build() {
    final _$result =
        _$v ??
        _$BookingManagementSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'BookingManagementSummary',
            'total',
          ),
          booked: BuiltValueNullFieldError.checkNotNull(
            booked,
            r'BookingManagementSummary',
            'booked',
          ),
          reschedulePending: BuiltValueNullFieldError.checkNotNull(
            reschedulePending,
            r'BookingManagementSummary',
            'reschedulePending',
          ),
          attended: BuiltValueNullFieldError.checkNotNull(
            attended,
            r'BookingManagementSummary',
            'attended',
          ),
          cancelled: BuiltValueNullFieldError.checkNotNull(
            cancelled,
            r'BookingManagementSummary',
            'cancelled',
          ),
          noShow: BuiltValueNullFieldError.checkNotNull(
            noShow,
            r'BookingManagementSummary',
            'noShow',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
