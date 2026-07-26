// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'list_identity_verifications200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ListIdentityVerifications200Response
    extends ListIdentityVerifications200Response {
  @override
  final BuiltList<IdentityVerificationDocument> items;

  factory _$ListIdentityVerifications200Response([
    void Function(ListIdentityVerifications200ResponseBuilder)? updates,
  ]) =>
      (ListIdentityVerifications200ResponseBuilder()..update(updates))._build();

  _$ListIdentityVerifications200Response._({required this.items}) : super._();
  @override
  ListIdentityVerifications200Response rebuild(
    void Function(ListIdentityVerifications200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ListIdentityVerifications200ResponseBuilder toBuilder() =>
      ListIdentityVerifications200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ListIdentityVerifications200Response &&
        items == other.items;
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
      r'ListIdentityVerifications200Response',
    )..add('items', items)).toString();
  }
}

class ListIdentityVerifications200ResponseBuilder
    implements
        Builder<
          ListIdentityVerifications200Response,
          ListIdentityVerifications200ResponseBuilder
        > {
  _$ListIdentityVerifications200Response? _$v;

  ListBuilder<IdentityVerificationDocument>? _items;
  ListBuilder<IdentityVerificationDocument> get items =>
      _$this._items ??= ListBuilder<IdentityVerificationDocument>();
  set items(ListBuilder<IdentityVerificationDocument>? items) =>
      _$this._items = items;

  ListIdentityVerifications200ResponseBuilder() {
    ListIdentityVerifications200Response._defaults(this);
  }

  ListIdentityVerifications200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ListIdentityVerifications200Response other) {
    _$v = other as _$ListIdentityVerifications200Response;
  }

  @override
  void update(
    void Function(ListIdentityVerifications200ResponseBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  ListIdentityVerifications200Response build() => _build();

  _$ListIdentityVerifications200Response _build() {
    _$ListIdentityVerifications200Response _$result;
    try {
      _$result =
          _$v ?? _$ListIdentityVerifications200Response._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ListIdentityVerifications200Response',
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
