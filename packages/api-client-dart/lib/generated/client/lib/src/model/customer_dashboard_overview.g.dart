// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerDashboardOverview extends CustomerDashboardOverview {
  @override
  final DateTime generatedAt;
  @override
  final BuiltList<CustomerDashboardOverviewUpcomingBookingsInner>
  upcomingBookings;
  @override
  final BuiltList<CustomerDashboardOverviewPackagesInner> packages;
  @override
  final BuiltList<CustomerDashboardOverviewActionableOrdersInner>
  actionableOrders;
  @override
  final CustomerDashboardOverviewVerification verification;
  @override
  final int unreadNotifications;

  factory _$CustomerDashboardOverview([
    void Function(CustomerDashboardOverviewBuilder)? updates,
  ]) => (CustomerDashboardOverviewBuilder()..update(updates))._build();

  _$CustomerDashboardOverview._({
    required this.generatedAt,
    required this.upcomingBookings,
    required this.packages,
    required this.actionableOrders,
    required this.verification,
    required this.unreadNotifications,
  }) : super._();
  @override
  CustomerDashboardOverview rebuild(
    void Function(CustomerDashboardOverviewBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewBuilder toBuilder() =>
      CustomerDashboardOverviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverview &&
        generatedAt == other.generatedAt &&
        upcomingBookings == other.upcomingBookings &&
        packages == other.packages &&
        actionableOrders == other.actionableOrders &&
        verification == other.verification &&
        unreadNotifications == other.unreadNotifications;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, upcomingBookings.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jc(_$hash, actionableOrders.hashCode);
    _$hash = $jc(_$hash, verification.hashCode);
    _$hash = $jc(_$hash, unreadNotifications.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerDashboardOverview')
          ..add('generatedAt', generatedAt)
          ..add('upcomingBookings', upcomingBookings)
          ..add('packages', packages)
          ..add('actionableOrders', actionableOrders)
          ..add('verification', verification)
          ..add('unreadNotifications', unreadNotifications))
        .toString();
  }
}

class CustomerDashboardOverviewBuilder
    implements
        Builder<CustomerDashboardOverview, CustomerDashboardOverviewBuilder> {
  _$CustomerDashboardOverview? _$v;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  ListBuilder<CustomerDashboardOverviewUpcomingBookingsInner>?
  _upcomingBookings;
  ListBuilder<CustomerDashboardOverviewUpcomingBookingsInner>
  get upcomingBookings => _$this._upcomingBookings ??=
      ListBuilder<CustomerDashboardOverviewUpcomingBookingsInner>();
  set upcomingBookings(
    ListBuilder<CustomerDashboardOverviewUpcomingBookingsInner>?
    upcomingBookings,
  ) => _$this._upcomingBookings = upcomingBookings;

  ListBuilder<CustomerDashboardOverviewPackagesInner>? _packages;
  ListBuilder<CustomerDashboardOverviewPackagesInner> get packages =>
      _$this._packages ??=
          ListBuilder<CustomerDashboardOverviewPackagesInner>();
  set packages(ListBuilder<CustomerDashboardOverviewPackagesInner>? packages) =>
      _$this._packages = packages;

  ListBuilder<CustomerDashboardOverviewActionableOrdersInner>?
  _actionableOrders;
  ListBuilder<CustomerDashboardOverviewActionableOrdersInner>
  get actionableOrders => _$this._actionableOrders ??=
      ListBuilder<CustomerDashboardOverviewActionableOrdersInner>();
  set actionableOrders(
    ListBuilder<CustomerDashboardOverviewActionableOrdersInner>?
    actionableOrders,
  ) => _$this._actionableOrders = actionableOrders;

  CustomerDashboardOverviewVerificationBuilder? _verification;
  CustomerDashboardOverviewVerificationBuilder get verification =>
      _$this._verification ??= CustomerDashboardOverviewVerificationBuilder();
  set verification(
    CustomerDashboardOverviewVerificationBuilder? verification,
  ) => _$this._verification = verification;

  int? _unreadNotifications;
  int? get unreadNotifications => _$this._unreadNotifications;
  set unreadNotifications(int? unreadNotifications) =>
      _$this._unreadNotifications = unreadNotifications;

  CustomerDashboardOverviewBuilder() {
    CustomerDashboardOverview._defaults(this);
  }

  CustomerDashboardOverviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _generatedAt = $v.generatedAt;
      _upcomingBookings = $v.upcomingBookings.toBuilder();
      _packages = $v.packages.toBuilder();
      _actionableOrders = $v.actionableOrders.toBuilder();
      _verification = $v.verification.toBuilder();
      _unreadNotifications = $v.unreadNotifications;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverview other) {
    _$v = other as _$CustomerDashboardOverview;
  }

  @override
  void update(void Function(CustomerDashboardOverviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverview build() => _build();

  _$CustomerDashboardOverview _build() {
    _$CustomerDashboardOverview _$result;
    try {
      _$result =
          _$v ??
          _$CustomerDashboardOverview._(
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'CustomerDashboardOverview',
              'generatedAt',
            ),
            upcomingBookings: upcomingBookings.build(),
            packages: packages.build(),
            actionableOrders: actionableOrders.build(),
            verification: verification.build(),
            unreadNotifications: BuiltValueNullFieldError.checkNotNull(
              unreadNotifications,
              r'CustomerDashboardOverview',
              'unreadNotifications',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'upcomingBookings';
        upcomingBookings.build();
        _$failedField = 'packages';
        packages.build();
        _$failedField = 'actionableOrders';
        actionableOrders.build();
        _$failedField = 'verification';
        verification.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerDashboardOverview',
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
