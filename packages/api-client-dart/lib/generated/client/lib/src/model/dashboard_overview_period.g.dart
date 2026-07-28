// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_overview_period.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardOverviewPeriod extends DashboardOverviewPeriod {
  @override
  final DateTime from;
  @override
  final DateTime until;
  @override
  final DateTime previousFrom;
  @override
  final DateTime previousUntil;

  factory _$DashboardOverviewPeriod([
    void Function(DashboardOverviewPeriodBuilder)? updates,
  ]) => (DashboardOverviewPeriodBuilder()..update(updates))._build();

  _$DashboardOverviewPeriod._({
    required this.from,
    required this.until,
    required this.previousFrom,
    required this.previousUntil,
  }) : super._();
  @override
  DashboardOverviewPeriod rebuild(
    void Function(DashboardOverviewPeriodBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DashboardOverviewPeriodBuilder toBuilder() =>
      DashboardOverviewPeriodBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardOverviewPeriod &&
        from == other.from &&
        until == other.until &&
        previousFrom == other.previousFrom &&
        previousUntil == other.previousUntil;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, from.hashCode);
    _$hash = $jc(_$hash, until.hashCode);
    _$hash = $jc(_$hash, previousFrom.hashCode);
    _$hash = $jc(_$hash, previousUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardOverviewPeriod')
          ..add('from', from)
          ..add('until', until)
          ..add('previousFrom', previousFrom)
          ..add('previousUntil', previousUntil))
        .toString();
  }
}

class DashboardOverviewPeriodBuilder
    implements
        Builder<DashboardOverviewPeriod, DashboardOverviewPeriodBuilder> {
  _$DashboardOverviewPeriod? _$v;

  DateTime? _from;
  DateTime? get from => _$this._from;
  set from(DateTime? from) => _$this._from = from;

  DateTime? _until;
  DateTime? get until => _$this._until;
  set until(DateTime? until) => _$this._until = until;

  DateTime? _previousFrom;
  DateTime? get previousFrom => _$this._previousFrom;
  set previousFrom(DateTime? previousFrom) =>
      _$this._previousFrom = previousFrom;

  DateTime? _previousUntil;
  DateTime? get previousUntil => _$this._previousUntil;
  set previousUntil(DateTime? previousUntil) =>
      _$this._previousUntil = previousUntil;

  DashboardOverviewPeriodBuilder() {
    DashboardOverviewPeriod._defaults(this);
  }

  DashboardOverviewPeriodBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _from = $v.from;
      _until = $v.until;
      _previousFrom = $v.previousFrom;
      _previousUntil = $v.previousUntil;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardOverviewPeriod other) {
    _$v = other as _$DashboardOverviewPeriod;
  }

  @override
  void update(void Function(DashboardOverviewPeriodBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardOverviewPeriod build() => _build();

  _$DashboardOverviewPeriod _build() {
    final _$result =
        _$v ??
        _$DashboardOverviewPeriod._(
          from: BuiltValueNullFieldError.checkNotNull(
            from,
            r'DashboardOverviewPeriod',
            'from',
          ),
          until: BuiltValueNullFieldError.checkNotNull(
            until,
            r'DashboardOverviewPeriod',
            'until',
          ),
          previousFrom: BuiltValueNullFieldError.checkNotNull(
            previousFrom,
            r'DashboardOverviewPeriod',
            'previousFrom',
          ),
          previousUntil: BuiltValueNullFieldError.checkNotNull(
            previousUntil,
            r'DashboardOverviewPeriod',
            'previousUntil',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
