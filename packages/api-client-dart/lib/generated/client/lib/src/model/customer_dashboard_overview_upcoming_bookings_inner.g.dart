// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview_upcoming_bookings_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerDashboardOverviewUpcomingBookingsInner
    extends CustomerDashboardOverviewUpcomingBookingsInner {
  @override
  final String id;
  @override
  final String status;
  @override
  final String className;
  @override
  final String branchName;
  @override
  final String timezone;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;

  factory _$CustomerDashboardOverviewUpcomingBookingsInner([
    void Function(CustomerDashboardOverviewUpcomingBookingsInnerBuilder)?
    updates,
  ]) =>
      (CustomerDashboardOverviewUpcomingBookingsInnerBuilder()..update(updates))
          ._build();

  _$CustomerDashboardOverviewUpcomingBookingsInner._({
    required this.id,
    required this.status,
    required this.className,
    required this.branchName,
    required this.timezone,
    required this.startAt,
    required this.endAt,
  }) : super._();
  @override
  CustomerDashboardOverviewUpcomingBookingsInner rebuild(
    void Function(CustomerDashboardOverviewUpcomingBookingsInnerBuilder)
    updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewUpcomingBookingsInnerBuilder toBuilder() =>
      CustomerDashboardOverviewUpcomingBookingsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverviewUpcomingBookingsInner &&
        id == other.id &&
        status == other.status &&
        className == other.className &&
        branchName == other.branchName &&
        timezone == other.timezone &&
        startAt == other.startAt &&
        endAt == other.endAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, className.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'CustomerDashboardOverviewUpcomingBookingsInner',
          )
          ..add('id', id)
          ..add('status', status)
          ..add('className', className)
          ..add('branchName', branchName)
          ..add('timezone', timezone)
          ..add('startAt', startAt)
          ..add('endAt', endAt))
        .toString();
  }
}

class CustomerDashboardOverviewUpcomingBookingsInnerBuilder
    implements
        Builder<
          CustomerDashboardOverviewUpcomingBookingsInner,
          CustomerDashboardOverviewUpcomingBookingsInnerBuilder
        > {
  _$CustomerDashboardOverviewUpcomingBookingsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _className;
  String? get className => _$this._className;
  set className(String? className) => _$this._className = className;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  CustomerDashboardOverviewUpcomingBookingsInnerBuilder() {
    CustomerDashboardOverviewUpcomingBookingsInner._defaults(this);
  }

  CustomerDashboardOverviewUpcomingBookingsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _className = $v.className;
      _branchName = $v.branchName;
      _timezone = $v.timezone;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverviewUpcomingBookingsInner other) {
    _$v = other as _$CustomerDashboardOverviewUpcomingBookingsInner;
  }

  @override
  void update(
    void Function(CustomerDashboardOverviewUpcomingBookingsInnerBuilder)?
    updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverviewUpcomingBookingsInner build() => _build();

  _$CustomerDashboardOverviewUpcomingBookingsInner _build() {
    final _$result =
        _$v ??
        _$CustomerDashboardOverviewUpcomingBookingsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'id',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'status',
          ),
          className: BuiltValueNullFieldError.checkNotNull(
            className,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'className',
          ),
          branchName: BuiltValueNullFieldError.checkNotNull(
            branchName,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'branchName',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'timezone',
          ),
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'CustomerDashboardOverviewUpcomingBookingsInner',
            'endAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
