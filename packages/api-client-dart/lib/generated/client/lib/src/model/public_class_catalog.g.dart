// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_class_catalog.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicClassCatalog extends PublicClassCatalog {
  @override
  final BuiltList<PublicBranch> branches;
  @override
  final BuiltList<PublicScheduleSummary> items;
  @override
  final PublicCatalogRange range;

  factory _$PublicClassCatalog([
    void Function(PublicClassCatalogBuilder)? updates,
  ]) => (PublicClassCatalogBuilder()..update(updates))._build();

  _$PublicClassCatalog._({
    required this.branches,
    required this.items,
    required this.range,
  }) : super._();
  @override
  PublicClassCatalog rebuild(
    void Function(PublicClassCatalogBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicClassCatalogBuilder toBuilder() =>
      PublicClassCatalogBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicClassCatalog &&
        branches == other.branches &&
        items == other.items &&
        range == other.range;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, range.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicClassCatalog')
          ..add('branches', branches)
          ..add('items', items)
          ..add('range', range))
        .toString();
  }
}

class PublicClassCatalogBuilder
    implements Builder<PublicClassCatalog, PublicClassCatalogBuilder> {
  _$PublicClassCatalog? _$v;

  ListBuilder<PublicBranch>? _branches;
  ListBuilder<PublicBranch> get branches =>
      _$this._branches ??= ListBuilder<PublicBranch>();
  set branches(ListBuilder<PublicBranch>? branches) =>
      _$this._branches = branches;

  ListBuilder<PublicScheduleSummary>? _items;
  ListBuilder<PublicScheduleSummary> get items =>
      _$this._items ??= ListBuilder<PublicScheduleSummary>();
  set items(ListBuilder<PublicScheduleSummary>? items) => _$this._items = items;

  PublicCatalogRangeBuilder? _range;
  PublicCatalogRangeBuilder get range =>
      _$this._range ??= PublicCatalogRangeBuilder();
  set range(PublicCatalogRangeBuilder? range) => _$this._range = range;

  PublicClassCatalogBuilder() {
    PublicClassCatalog._defaults(this);
  }

  PublicClassCatalogBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branches = $v.branches.toBuilder();
      _items = $v.items.toBuilder();
      _range = $v.range.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicClassCatalog other) {
    _$v = other as _$PublicClassCatalog;
  }

  @override
  void update(void Function(PublicClassCatalogBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicClassCatalog build() => _build();

  _$PublicClassCatalog _build() {
    _$PublicClassCatalog _$result;
    try {
      _$result =
          _$v ??
          _$PublicClassCatalog._(
            branches: branches.build(),
            items: items.build(),
            range: range.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branches';
        branches.build();
        _$failedField = 'items';
        items.build();
        _$failedField = 'range';
        range.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicClassCatalog',
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
