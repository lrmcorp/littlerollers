// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_dashboard_overview_packages_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerDashboardOverviewPackagesInner
    extends CustomerDashboardOverviewPackagesInner {
  @override
  final String id;
  @override
  final String packageName;
  @override
  final String classTypeName;
  @override
  final String branchName;
  @override
  final DateTime expiryAt;
  @override
  final int available;

  factory _$CustomerDashboardOverviewPackagesInner([
    void Function(CustomerDashboardOverviewPackagesInnerBuilder)? updates,
  ]) => (CustomerDashboardOverviewPackagesInnerBuilder()..update(updates))
      ._build();

  _$CustomerDashboardOverviewPackagesInner._({
    required this.id,
    required this.packageName,
    required this.classTypeName,
    required this.branchName,
    required this.expiryAt,
    required this.available,
  }) : super._();
  @override
  CustomerDashboardOverviewPackagesInner rebuild(
    void Function(CustomerDashboardOverviewPackagesInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerDashboardOverviewPackagesInnerBuilder toBuilder() =>
      CustomerDashboardOverviewPackagesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerDashboardOverviewPackagesInner &&
        id == other.id &&
        packageName == other.packageName &&
        classTypeName == other.classTypeName &&
        branchName == other.branchName &&
        expiryAt == other.expiryAt &&
        available == other.available;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, packageName.hashCode);
    _$hash = $jc(_$hash, classTypeName.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'CustomerDashboardOverviewPackagesInner',
          )
          ..add('id', id)
          ..add('packageName', packageName)
          ..add('classTypeName', classTypeName)
          ..add('branchName', branchName)
          ..add('expiryAt', expiryAt)
          ..add('available', available))
        .toString();
  }
}

class CustomerDashboardOverviewPackagesInnerBuilder
    implements
        Builder<
          CustomerDashboardOverviewPackagesInner,
          CustomerDashboardOverviewPackagesInnerBuilder
        > {
  _$CustomerDashboardOverviewPackagesInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _packageName;
  String? get packageName => _$this._packageName;
  set packageName(String? packageName) => _$this._packageName = packageName;

  String? _classTypeName;
  String? get classTypeName => _$this._classTypeName;
  set classTypeName(String? classTypeName) =>
      _$this._classTypeName = classTypeName;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  CustomerDashboardOverviewPackagesInnerBuilder() {
    CustomerDashboardOverviewPackagesInner._defaults(this);
  }

  CustomerDashboardOverviewPackagesInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _packageName = $v.packageName;
      _classTypeName = $v.classTypeName;
      _branchName = $v.branchName;
      _expiryAt = $v.expiryAt;
      _available = $v.available;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerDashboardOverviewPackagesInner other) {
    _$v = other as _$CustomerDashboardOverviewPackagesInner;
  }

  @override
  void update(
    void Function(CustomerDashboardOverviewPackagesInnerBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerDashboardOverviewPackagesInner build() => _build();

  _$CustomerDashboardOverviewPackagesInner _build() {
    final _$result =
        _$v ??
        _$CustomerDashboardOverviewPackagesInner._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerDashboardOverviewPackagesInner',
            'id',
          ),
          packageName: BuiltValueNullFieldError.checkNotNull(
            packageName,
            r'CustomerDashboardOverviewPackagesInner',
            'packageName',
          ),
          classTypeName: BuiltValueNullFieldError.checkNotNull(
            classTypeName,
            r'CustomerDashboardOverviewPackagesInner',
            'classTypeName',
          ),
          branchName: BuiltValueNullFieldError.checkNotNull(
            branchName,
            r'CustomerDashboardOverviewPackagesInner',
            'branchName',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'CustomerDashboardOverviewPackagesInner',
            'expiryAt',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'CustomerDashboardOverviewPackagesInner',
            'available',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
