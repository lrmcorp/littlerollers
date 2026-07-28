// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_risk_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardRiskItem extends DashboardRiskItem {
  @override
  final String id;
  @override
  final String branchName;
  @override
  final String branchCode;
  @override
  final String className;
  @override
  final DateTime startAt;
  @override
  final int bookedCount;
  @override
  final int minimumQuota;
  @override
  final int capacity;
  @override
  final String href;

  factory _$DashboardRiskItem([
    void Function(DashboardRiskItemBuilder)? updates,
  ]) => (DashboardRiskItemBuilder()..update(updates))._build();

  _$DashboardRiskItem._({
    required this.id,
    required this.branchName,
    required this.branchCode,
    required this.className,
    required this.startAt,
    required this.bookedCount,
    required this.minimumQuota,
    required this.capacity,
    required this.href,
  }) : super._();
  @override
  DashboardRiskItem rebuild(void Function(DashboardRiskItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DashboardRiskItemBuilder toBuilder() =>
      DashboardRiskItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardRiskItem &&
        id == other.id &&
        branchName == other.branchName &&
        branchCode == other.branchCode &&
        className == other.className &&
        startAt == other.startAt &&
        bookedCount == other.bookedCount &&
        minimumQuota == other.minimumQuota &&
        capacity == other.capacity &&
        href == other.href;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, branchCode.hashCode);
    _$hash = $jc(_$hash, className.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, bookedCount.hashCode);
    _$hash = $jc(_$hash, minimumQuota.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, href.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardRiskItem')
          ..add('id', id)
          ..add('branchName', branchName)
          ..add('branchCode', branchCode)
          ..add('className', className)
          ..add('startAt', startAt)
          ..add('bookedCount', bookedCount)
          ..add('minimumQuota', minimumQuota)
          ..add('capacity', capacity)
          ..add('href', href))
        .toString();
  }
}

class DashboardRiskItemBuilder
    implements Builder<DashboardRiskItem, DashboardRiskItemBuilder> {
  _$DashboardRiskItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  String? _branchCode;
  String? get branchCode => _$this._branchCode;
  set branchCode(String? branchCode) => _$this._branchCode = branchCode;

  String? _className;
  String? get className => _$this._className;
  set className(String? className) => _$this._className = className;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  int? _bookedCount;
  int? get bookedCount => _$this._bookedCount;
  set bookedCount(int? bookedCount) => _$this._bookedCount = bookedCount;

  int? _minimumQuota;
  int? get minimumQuota => _$this._minimumQuota;
  set minimumQuota(int? minimumQuota) => _$this._minimumQuota = minimumQuota;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  String? _href;
  String? get href => _$this._href;
  set href(String? href) => _$this._href = href;

  DashboardRiskItemBuilder() {
    DashboardRiskItem._defaults(this);
  }

  DashboardRiskItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchName = $v.branchName;
      _branchCode = $v.branchCode;
      _className = $v.className;
      _startAt = $v.startAt;
      _bookedCount = $v.bookedCount;
      _minimumQuota = $v.minimumQuota;
      _capacity = $v.capacity;
      _href = $v.href;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardRiskItem other) {
    _$v = other as _$DashboardRiskItem;
  }

  @override
  void update(void Function(DashboardRiskItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardRiskItem build() => _build();

  _$DashboardRiskItem _build() {
    final _$result =
        _$v ??
        _$DashboardRiskItem._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'DashboardRiskItem',
            'id',
          ),
          branchName: BuiltValueNullFieldError.checkNotNull(
            branchName,
            r'DashboardRiskItem',
            'branchName',
          ),
          branchCode: BuiltValueNullFieldError.checkNotNull(
            branchCode,
            r'DashboardRiskItem',
            'branchCode',
          ),
          className: BuiltValueNullFieldError.checkNotNull(
            className,
            r'DashboardRiskItem',
            'className',
          ),
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'DashboardRiskItem',
            'startAt',
          ),
          bookedCount: BuiltValueNullFieldError.checkNotNull(
            bookedCount,
            r'DashboardRiskItem',
            'bookedCount',
          ),
          minimumQuota: BuiltValueNullFieldError.checkNotNull(
            minimumQuota,
            r'DashboardRiskItem',
            'minimumQuota',
          ),
          capacity: BuiltValueNullFieldError.checkNotNull(
            capacity,
            r'DashboardRiskItem',
            'capacity',
          ),
          href: BuiltValueNullFieldError.checkNotNull(
            href,
            r'DashboardRiskItem',
            'href',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
