// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerBookingOptions extends CustomerBookingOptions {
  @override
  final CustomerBookingSlot slot;
  @override
  final BuiltList<CustomerBookingPackage> packages;

  factory _$CustomerBookingOptions([
    void Function(CustomerBookingOptionsBuilder)? updates,
  ]) => (CustomerBookingOptionsBuilder()..update(updates))._build();

  _$CustomerBookingOptions._({required this.slot, required this.packages})
    : super._();
  @override
  CustomerBookingOptions rebuild(
    void Function(CustomerBookingOptionsBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingOptionsBuilder toBuilder() =>
      CustomerBookingOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingOptions &&
        slot == other.slot &&
        packages == other.packages;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, slot.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingOptions')
          ..add('slot', slot)
          ..add('packages', packages))
        .toString();
  }
}

class CustomerBookingOptionsBuilder
    implements Builder<CustomerBookingOptions, CustomerBookingOptionsBuilder> {
  _$CustomerBookingOptions? _$v;

  CustomerBookingSlotBuilder? _slot;
  CustomerBookingSlotBuilder get slot =>
      _$this._slot ??= CustomerBookingSlotBuilder();
  set slot(CustomerBookingSlotBuilder? slot) => _$this._slot = slot;

  ListBuilder<CustomerBookingPackage>? _packages;
  ListBuilder<CustomerBookingPackage> get packages =>
      _$this._packages ??= ListBuilder<CustomerBookingPackage>();
  set packages(ListBuilder<CustomerBookingPackage>? packages) =>
      _$this._packages = packages;

  CustomerBookingOptionsBuilder() {
    CustomerBookingOptions._defaults(this);
  }

  CustomerBookingOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _slot = $v.slot.toBuilder();
      _packages = $v.packages.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingOptions other) {
    _$v = other as _$CustomerBookingOptions;
  }

  @override
  void update(void Function(CustomerBookingOptionsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingOptions build() => _build();

  _$CustomerBookingOptions _build() {
    _$CustomerBookingOptions _$result;
    try {
      _$result =
          _$v ??
          _$CustomerBookingOptions._(
            slot: slot.build(),
            packages: packages.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'slot';
        slot.build();
        _$failedField = 'packages';
        packages.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerBookingOptions',
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
