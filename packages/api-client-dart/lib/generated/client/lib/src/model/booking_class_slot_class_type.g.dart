// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_class_slot_class_type.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingClassSlotClassType extends BookingClassSlotClassType {
  @override
  final String id;
  @override
  final String name;

  factory _$BookingClassSlotClassType([
    void Function(BookingClassSlotClassTypeBuilder)? updates,
  ]) => (BookingClassSlotClassTypeBuilder()..update(updates))._build();

  _$BookingClassSlotClassType._({required this.id, required this.name})
    : super._();
  @override
  BookingClassSlotClassType rebuild(
    void Function(BookingClassSlotClassTypeBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BookingClassSlotClassTypeBuilder toBuilder() =>
      BookingClassSlotClassTypeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingClassSlotClassType &&
        id == other.id &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingClassSlotClassType')
          ..add('id', id)
          ..add('name', name))
        .toString();
  }
}

class BookingClassSlotClassTypeBuilder
    implements
        Builder<BookingClassSlotClassType, BookingClassSlotClassTypeBuilder> {
  _$BookingClassSlotClassType? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  BookingClassSlotClassTypeBuilder() {
    BookingClassSlotClassType._defaults(this);
  }

  BookingClassSlotClassTypeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingClassSlotClassType other) {
    _$v = other as _$BookingClassSlotClassType;
  }

  @override
  void update(void Function(BookingClassSlotClassTypeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingClassSlotClassType build() => _build();

  _$BookingClassSlotClassType _build() {
    final _$result =
        _$v ??
        _$BookingClassSlotClassType._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'BookingClassSlotClassType',
            'id',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'BookingClassSlotClassType',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
