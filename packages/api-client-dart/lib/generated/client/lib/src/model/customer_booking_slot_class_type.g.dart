// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_slot_class_type.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerBookingSlotClassType extends CustomerBookingSlotClassType {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$CustomerBookingSlotClassType([
    void Function(CustomerBookingSlotClassTypeBuilder)? updates,
  ]) => (CustomerBookingSlotClassTypeBuilder()..update(updates))._build();

  _$CustomerBookingSlotClassType._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  CustomerBookingSlotClassType rebuild(
    void Function(CustomerBookingSlotClassTypeBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingSlotClassTypeBuilder toBuilder() =>
      CustomerBookingSlotClassTypeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingSlotClassType &&
        id == other.id &&
        code == other.code &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingSlotClassType')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class CustomerBookingSlotClassTypeBuilder
    implements
        Builder<
          CustomerBookingSlotClassType,
          CustomerBookingSlotClassTypeBuilder
        > {
  _$CustomerBookingSlotClassType? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  CustomerBookingSlotClassTypeBuilder() {
    CustomerBookingSlotClassType._defaults(this);
  }

  CustomerBookingSlotClassTypeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingSlotClassType other) {
    _$v = other as _$CustomerBookingSlotClassType;
  }

  @override
  void update(void Function(CustomerBookingSlotClassTypeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingSlotClassType build() => _build();

  _$CustomerBookingSlotClassType _build() {
    final _$result =
        _$v ??
        _$CustomerBookingSlotClassType._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerBookingSlotClassType',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'CustomerBookingSlotClassType',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'CustomerBookingSlotClassType',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
