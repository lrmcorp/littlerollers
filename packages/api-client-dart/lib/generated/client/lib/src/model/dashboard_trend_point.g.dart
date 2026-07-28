// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_trend_point.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardTrendPoint extends DashboardTrendPoint {
  @override
  final Date date;
  @override
  final int revenue;
  @override
  final int bookings;

  factory _$DashboardTrendPoint([
    void Function(DashboardTrendPointBuilder)? updates,
  ]) => (DashboardTrendPointBuilder()..update(updates))._build();

  _$DashboardTrendPoint._({
    required this.date,
    required this.revenue,
    required this.bookings,
  }) : super._();
  @override
  DashboardTrendPoint rebuild(
    void Function(DashboardTrendPointBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DashboardTrendPointBuilder toBuilder() =>
      DashboardTrendPointBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardTrendPoint &&
        date == other.date &&
        revenue == other.revenue &&
        bookings == other.bookings;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, date.hashCode);
    _$hash = $jc(_$hash, revenue.hashCode);
    _$hash = $jc(_$hash, bookings.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardTrendPoint')
          ..add('date', date)
          ..add('revenue', revenue)
          ..add('bookings', bookings))
        .toString();
  }
}

class DashboardTrendPointBuilder
    implements Builder<DashboardTrendPoint, DashboardTrendPointBuilder> {
  _$DashboardTrendPoint? _$v;

  Date? _date;
  Date? get date => _$this._date;
  set date(Date? date) => _$this._date = date;

  int? _revenue;
  int? get revenue => _$this._revenue;
  set revenue(int? revenue) => _$this._revenue = revenue;

  int? _bookings;
  int? get bookings => _$this._bookings;
  set bookings(int? bookings) => _$this._bookings = bookings;

  DashboardTrendPointBuilder() {
    DashboardTrendPoint._defaults(this);
  }

  DashboardTrendPointBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _date = $v.date;
      _revenue = $v.revenue;
      _bookings = $v.bookings;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardTrendPoint other) {
    _$v = other as _$DashboardTrendPoint;
  }

  @override
  void update(void Function(DashboardTrendPointBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardTrendPoint build() => _build();

  _$DashboardTrendPoint _build() {
    final _$result =
        _$v ??
        _$DashboardTrendPoint._(
          date: BuiltValueNullFieldError.checkNotNull(
            date,
            r'DashboardTrendPoint',
            'date',
          ),
          revenue: BuiltValueNullFieldError.checkNotNull(
            revenue,
            r'DashboardTrendPoint',
            'revenue',
          ),
          bookings: BuiltValueNullFieldError.checkNotNull(
            bookings,
            r'DashboardTrendPoint',
            'bookings',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
