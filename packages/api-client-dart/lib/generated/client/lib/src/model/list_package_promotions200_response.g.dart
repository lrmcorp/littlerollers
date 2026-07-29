// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'list_package_promotions200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ListPackagePromotions200Response
    extends ListPackagePromotions200Response {
  @override
  final BuiltList<PackagePromotion> items;

  factory _$ListPackagePromotions200Response([
    void Function(ListPackagePromotions200ResponseBuilder)? updates,
  ]) => (ListPackagePromotions200ResponseBuilder()..update(updates))._build();

  _$ListPackagePromotions200Response._({required this.items}) : super._();
  @override
  ListPackagePromotions200Response rebuild(
    void Function(ListPackagePromotions200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ListPackagePromotions200ResponseBuilder toBuilder() =>
      ListPackagePromotions200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ListPackagePromotions200Response && items == other.items;
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
      r'ListPackagePromotions200Response',
    )..add('items', items)).toString();
  }
}

class ListPackagePromotions200ResponseBuilder
    implements
        Builder<
          ListPackagePromotions200Response,
          ListPackagePromotions200ResponseBuilder
        > {
  _$ListPackagePromotions200Response? _$v;

  ListBuilder<PackagePromotion>? _items;
  ListBuilder<PackagePromotion> get items =>
      _$this._items ??= ListBuilder<PackagePromotion>();
  set items(ListBuilder<PackagePromotion>? items) => _$this._items = items;

  ListPackagePromotions200ResponseBuilder() {
    ListPackagePromotions200Response._defaults(this);
  }

  ListPackagePromotions200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ListPackagePromotions200Response other) {
    _$v = other as _$ListPackagePromotions200Response;
  }

  @override
  void update(void Function(ListPackagePromotions200ResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ListPackagePromotions200Response build() => _build();

  _$ListPackagePromotions200Response _build() {
    _$ListPackagePromotions200Response _$result;
    try {
      _$result =
          _$v ?? _$ListPackagePromotions200Response._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ListPackagePromotions200Response',
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
