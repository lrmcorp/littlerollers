// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'capability_definition_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CapabilityDefinitionPage extends CapabilityDefinitionPage {
  @override
  final BuiltList<CapabilityDefinition> items;

  factory _$CapabilityDefinitionPage([
    void Function(CapabilityDefinitionPageBuilder)? updates,
  ]) => (CapabilityDefinitionPageBuilder()..update(updates))._build();

  _$CapabilityDefinitionPage._({required this.items}) : super._();
  @override
  CapabilityDefinitionPage rebuild(
    void Function(CapabilityDefinitionPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CapabilityDefinitionPageBuilder toBuilder() =>
      CapabilityDefinitionPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CapabilityDefinitionPage && items == other.items;
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
      r'CapabilityDefinitionPage',
    )..add('items', items)).toString();
  }
}

class CapabilityDefinitionPageBuilder
    implements
        Builder<CapabilityDefinitionPage, CapabilityDefinitionPageBuilder> {
  _$CapabilityDefinitionPage? _$v;

  ListBuilder<CapabilityDefinition>? _items;
  ListBuilder<CapabilityDefinition> get items =>
      _$this._items ??= ListBuilder<CapabilityDefinition>();
  set items(ListBuilder<CapabilityDefinition>? items) => _$this._items = items;

  CapabilityDefinitionPageBuilder() {
    CapabilityDefinitionPage._defaults(this);
  }

  CapabilityDefinitionPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CapabilityDefinitionPage other) {
    _$v = other as _$CapabilityDefinitionPage;
  }

  @override
  void update(void Function(CapabilityDefinitionPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CapabilityDefinitionPage build() => _build();

  _$CapabilityDefinitionPage _build() {
    _$CapabilityDefinitionPage _$result;
    try {
      _$result = _$v ?? _$CapabilityDefinitionPage._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CapabilityDefinitionPage',
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
