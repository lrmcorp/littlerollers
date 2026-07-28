// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_customer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingCustomer extends BookingCustomer {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneMasked;

  factory _$BookingCustomer([void Function(BookingCustomerBuilder)? updates]) =>
      (BookingCustomerBuilder()..update(updates))._build();

  _$BookingCustomer._({
    required this.id,
    required this.displayName,
    this.phoneMasked,
  }) : super._();
  @override
  BookingCustomer rebuild(void Function(BookingCustomerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingCustomerBuilder toBuilder() => BookingCustomerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingCustomer &&
        id == other.id &&
        displayName == other.displayName &&
        phoneMasked == other.phoneMasked;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phoneMasked.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingCustomer')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneMasked', phoneMasked))
        .toString();
  }
}

class BookingCustomerBuilder
    implements Builder<BookingCustomer, BookingCustomerBuilder> {
  _$BookingCustomer? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  BookingCustomerBuilder() {
    BookingCustomer._defaults(this);
  }

  BookingCustomerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _phoneMasked = $v.phoneMasked;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingCustomer other) {
    _$v = other as _$BookingCustomer;
  }

  @override
  void update(void Function(BookingCustomerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingCustomer build() => _build();

  _$BookingCustomer _build() {
    final _$result =
        _$v ??
        _$BookingCustomer._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'BookingCustomer',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'BookingCustomer',
            'displayName',
          ),
          phoneMasked: phoneMasked,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
