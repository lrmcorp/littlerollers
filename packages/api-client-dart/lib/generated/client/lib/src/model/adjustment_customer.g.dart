// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_customer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdjustmentCustomer extends AdjustmentCustomer {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneMasked;

  factory _$AdjustmentCustomer([
    void Function(AdjustmentCustomerBuilder)? updates,
  ]) => (AdjustmentCustomerBuilder()..update(updates))._build();

  _$AdjustmentCustomer._({
    required this.id,
    required this.displayName,
    this.phoneMasked,
  }) : super._();
  @override
  AdjustmentCustomer rebuild(
    void Function(AdjustmentCustomerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AdjustmentCustomerBuilder toBuilder() =>
      AdjustmentCustomerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentCustomer &&
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
    return (newBuiltValueToStringHelper(r'AdjustmentCustomer')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneMasked', phoneMasked))
        .toString();
  }
}

class AdjustmentCustomerBuilder
    implements Builder<AdjustmentCustomer, AdjustmentCustomerBuilder> {
  _$AdjustmentCustomer? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  AdjustmentCustomerBuilder() {
    AdjustmentCustomer._defaults(this);
  }

  AdjustmentCustomerBuilder get _$this {
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
  void replace(AdjustmentCustomer other) {
    _$v = other as _$AdjustmentCustomer;
  }

  @override
  void update(void Function(AdjustmentCustomerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentCustomer build() => _build();

  _$AdjustmentCustomer _build() {
    final _$result =
        _$v ??
        _$AdjustmentCustomer._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AdjustmentCustomer',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'AdjustmentCustomer',
            'displayName',
          ),
          phoneMasked: phoneMasked,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
