// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'list_payment_accounts200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ListPaymentAccounts200Response extends ListPaymentAccounts200Response {
  @override
  final BuiltList<PaymentAccount> items;

  factory _$ListPaymentAccounts200Response([
    void Function(ListPaymentAccounts200ResponseBuilder)? updates,
  ]) => (ListPaymentAccounts200ResponseBuilder()..update(updates))._build();

  _$ListPaymentAccounts200Response._({required this.items}) : super._();
  @override
  ListPaymentAccounts200Response rebuild(
    void Function(ListPaymentAccounts200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ListPaymentAccounts200ResponseBuilder toBuilder() =>
      ListPaymentAccounts200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ListPaymentAccounts200Response && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'ListPaymentAccounts200Response',
    )..add('items', items)).toString();
  }
}

class ListPaymentAccounts200ResponseBuilder
    implements
        Builder<
          ListPaymentAccounts200Response,
          ListPaymentAccounts200ResponseBuilder
        > {
  _$ListPaymentAccounts200Response? _$v;

  ListBuilder<PaymentAccount>? _items;
  ListBuilder<PaymentAccount> get items =>
      _$this._items ??= ListBuilder<PaymentAccount>();
  set items(ListBuilder<PaymentAccount>? items) => _$this._items = items;

  ListPaymentAccounts200ResponseBuilder() {
    ListPaymentAccounts200Response._defaults(this);
  }

  ListPaymentAccounts200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ListPaymentAccounts200Response other) {
    _$v = other as _$ListPaymentAccounts200Response;
  }

  @override
  void update(void Function(ListPaymentAccounts200ResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ListPaymentAccounts200Response build() => _build();

  _$ListPaymentAccounts200Response _build() {
    _$ListPaymentAccounts200Response _$result;
    try {
      _$result =
          _$v ?? _$ListPaymentAccounts200Response._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ListPaymentAccounts200Response',
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
