// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_package_catalog.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicPackageCatalog extends PublicPackageCatalog {
  @override
  final BuiltList<PublicBranch> branches;
  @override
  final BuiltList<PublicPackageSummary> items;

  factory _$PublicPackageCatalog([
    void Function(PublicPackageCatalogBuilder)? updates,
  ]) => (PublicPackageCatalogBuilder()..update(updates))._build();

  _$PublicPackageCatalog._({required this.branches, required this.items})
    : super._();
  @override
  PublicPackageCatalog rebuild(
    void Function(PublicPackageCatalogBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicPackageCatalogBuilder toBuilder() =>
      PublicPackageCatalogBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicPackageCatalog &&
        branches == other.branches &&
        items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicPackageCatalog')
          ..add('branches', branches)
          ..add('items', items))
        .toString();
  }
}

class PublicPackageCatalogBuilder
    implements Builder<PublicPackageCatalog, PublicPackageCatalogBuilder> {
  _$PublicPackageCatalog? _$v;

  ListBuilder<PublicBranch>? _branches;
  ListBuilder<PublicBranch> get branches =>
      _$this._branches ??= ListBuilder<PublicBranch>();
  set branches(ListBuilder<PublicBranch>? branches) =>
      _$this._branches = branches;

  ListBuilder<PublicPackageSummary>? _items;
  ListBuilder<PublicPackageSummary> get items =>
      _$this._items ??= ListBuilder<PublicPackageSummary>();
  set items(ListBuilder<PublicPackageSummary>? items) => _$this._items = items;

  PublicPackageCatalogBuilder() {
    PublicPackageCatalog._defaults(this);
  }

  PublicPackageCatalogBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branches = $v.branches.toBuilder();
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicPackageCatalog other) {
    _$v = other as _$PublicPackageCatalog;
  }

  @override
  void update(void Function(PublicPackageCatalogBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicPackageCatalog build() => _build();

  _$PublicPackageCatalog _build() {
    _$PublicPackageCatalog _$result;
    try {
      _$result =
          _$v ??
          _$PublicPackageCatalog._(
            branches: branches.build(),
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branches';
        branches.build();
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicPackageCatalog',
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
