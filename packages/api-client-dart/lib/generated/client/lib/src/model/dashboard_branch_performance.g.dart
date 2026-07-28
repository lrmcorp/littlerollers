// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_branch_performance.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardBranchPerformance extends DashboardBranchPerformance {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final int revenueRp;
  @override
  final int bookings;
  @override
  final num occupancyPercent;

  factory _$DashboardBranchPerformance([
    void Function(DashboardBranchPerformanceBuilder)? updates,
  ]) => (DashboardBranchPerformanceBuilder()..update(updates))._build();

  _$DashboardBranchPerformance._({
    required this.id,
    required this.code,
    required this.name,
    required this.revenueRp,
    required this.bookings,
    required this.occupancyPercent,
  }) : super._();
  @override
  DashboardBranchPerformance rebuild(
    void Function(DashboardBranchPerformanceBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DashboardBranchPerformanceBuilder toBuilder() =>
      DashboardBranchPerformanceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardBranchPerformance &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        revenueRp == other.revenueRp &&
        bookings == other.bookings &&
        occupancyPercent == other.occupancyPercent;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, revenueRp.hashCode);
    _$hash = $jc(_$hash, bookings.hashCode);
    _$hash = $jc(_$hash, occupancyPercent.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardBranchPerformance')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('revenueRp', revenueRp)
          ..add('bookings', bookings)
          ..add('occupancyPercent', occupancyPercent))
        .toString();
  }
}

class DashboardBranchPerformanceBuilder
    implements
        Builder<DashboardBranchPerformance, DashboardBranchPerformanceBuilder> {
  _$DashboardBranchPerformance? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _revenueRp;
  int? get revenueRp => _$this._revenueRp;
  set revenueRp(int? revenueRp) => _$this._revenueRp = revenueRp;

  int? _bookings;
  int? get bookings => _$this._bookings;
  set bookings(int? bookings) => _$this._bookings = bookings;

  num? _occupancyPercent;
  num? get occupancyPercent => _$this._occupancyPercent;
  set occupancyPercent(num? occupancyPercent) =>
      _$this._occupancyPercent = occupancyPercent;

  DashboardBranchPerformanceBuilder() {
    DashboardBranchPerformance._defaults(this);
  }

  DashboardBranchPerformanceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _revenueRp = $v.revenueRp;
      _bookings = $v.bookings;
      _occupancyPercent = $v.occupancyPercent;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardBranchPerformance other) {
    _$v = other as _$DashboardBranchPerformance;
  }

  @override
  void update(void Function(DashboardBranchPerformanceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardBranchPerformance build() => _build();

  _$DashboardBranchPerformance _build() {
    final _$result =
        _$v ??
        _$DashboardBranchPerformance._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'DashboardBranchPerformance',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'DashboardBranchPerformance',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'DashboardBranchPerformance',
            'name',
          ),
          revenueRp: BuiltValueNullFieldError.checkNotNull(
            revenueRp,
            r'DashboardBranchPerformance',
            'revenueRp',
          ),
          bookings: BuiltValueNullFieldError.checkNotNull(
            bookings,
            r'DashboardBranchPerformance',
            'bookings',
          ),
          occupancyPercent: BuiltValueNullFieldError.checkNotNull(
            occupancyPercent,
            r'DashboardBranchPerformance',
            'occupancyPercent',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
