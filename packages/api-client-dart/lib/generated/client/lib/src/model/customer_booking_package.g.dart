// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_package.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerBookingPackage extends CustomerBookingPackage {
  @override
  final String id;
  @override
  final String packageId;
  @override
  final String name;
  @override
  final int available;
  @override
  final int projectedAvailable;
  @override
  final DateTime expiryAt;

  factory _$CustomerBookingPackage([
    void Function(CustomerBookingPackageBuilder)? updates,
  ]) => (CustomerBookingPackageBuilder()..update(updates))._build();

  _$CustomerBookingPackage._({
    required this.id,
    required this.packageId,
    required this.name,
    required this.available,
    required this.projectedAvailable,
    required this.expiryAt,
  }) : super._();
  @override
  CustomerBookingPackage rebuild(
    void Function(CustomerBookingPackageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingPackageBuilder toBuilder() =>
      CustomerBookingPackageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingPackage &&
        id == other.id &&
        packageId == other.packageId &&
        name == other.name &&
        available == other.available &&
        projectedAvailable == other.projectedAvailable &&
        expiryAt == other.expiryAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, projectedAvailable.hashCode);
    _$hash = $jc(_$hash, expiryAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingPackage')
          ..add('id', id)
          ..add('packageId', packageId)
          ..add('name', name)
          ..add('available', available)
          ..add('projectedAvailable', projectedAvailable)
          ..add('expiryAt', expiryAt))
        .toString();
  }
}

class CustomerBookingPackageBuilder
    implements Builder<CustomerBookingPackage, CustomerBookingPackageBuilder> {
  _$CustomerBookingPackage? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  int? _projectedAvailable;
  int? get projectedAvailable => _$this._projectedAvailable;
  set projectedAvailable(int? projectedAvailable) =>
      _$this._projectedAvailable = projectedAvailable;

  DateTime? _expiryAt;
  DateTime? get expiryAt => _$this._expiryAt;
  set expiryAt(DateTime? expiryAt) => _$this._expiryAt = expiryAt;

  CustomerBookingPackageBuilder() {
    CustomerBookingPackage._defaults(this);
  }

  CustomerBookingPackageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _packageId = $v.packageId;
      _name = $v.name;
      _available = $v.available;
      _projectedAvailable = $v.projectedAvailable;
      _expiryAt = $v.expiryAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingPackage other) {
    _$v = other as _$CustomerBookingPackage;
  }

  @override
  void update(void Function(CustomerBookingPackageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingPackage build() => _build();

  _$CustomerBookingPackage _build() {
    final _$result =
        _$v ??
        _$CustomerBookingPackage._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerBookingPackage',
            'id',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'CustomerBookingPackage',
            'packageId',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'CustomerBookingPackage',
            'name',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'CustomerBookingPackage',
            'available',
          ),
          projectedAvailable: BuiltValueNullFieldError.checkNotNull(
            projectedAvailable,
            r'CustomerBookingPackage',
            'projectedAvailable',
          ),
          expiryAt: BuiltValueNullFieldError.checkNotNull(
            expiryAt,
            r'CustomerBookingPackage',
            'expiryAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
