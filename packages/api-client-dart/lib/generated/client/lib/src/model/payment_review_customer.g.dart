// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_customer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentReviewCustomer extends PaymentReviewCustomer {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneMasked;

  factory _$PaymentReviewCustomer([
    void Function(PaymentReviewCustomerBuilder)? updates,
  ]) => (PaymentReviewCustomerBuilder()..update(updates))._build();

  _$PaymentReviewCustomer._({
    required this.id,
    required this.displayName,
    this.phoneMasked,
  }) : super._();
  @override
  PaymentReviewCustomer rebuild(
    void Function(PaymentReviewCustomerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentReviewCustomerBuilder toBuilder() =>
      PaymentReviewCustomerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewCustomer &&
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
    return (newBuiltValueToStringHelper(r'PaymentReviewCustomer')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneMasked', phoneMasked))
        .toString();
  }
}

class PaymentReviewCustomerBuilder
    implements Builder<PaymentReviewCustomer, PaymentReviewCustomerBuilder> {
  _$PaymentReviewCustomer? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  PaymentReviewCustomerBuilder() {
    PaymentReviewCustomer._defaults(this);
  }

  PaymentReviewCustomerBuilder get _$this {
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
  void replace(PaymentReviewCustomer other) {
    _$v = other as _$PaymentReviewCustomer;
  }

  @override
  void update(void Function(PaymentReviewCustomerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewCustomer build() => _build();

  _$PaymentReviewCustomer _build() {
    final _$result =
        _$v ??
        _$PaymentReviewCustomer._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentReviewCustomer',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'PaymentReviewCustomer',
            'displayName',
          ),
          phoneMasked: phoneMasked,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
