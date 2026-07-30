// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_packages_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VoucherPackagesInner extends VoucherPackagesInner {
  @override
  final String id;
  @override
  final String name;

  factory _$VoucherPackagesInner([
    void Function(VoucherPackagesInnerBuilder)? updates,
  ]) => (VoucherPackagesInnerBuilder()..update(updates))._build();

  _$VoucherPackagesInner._({required this.id, required this.name}) : super._();
  @override
  VoucherPackagesInner rebuild(
    void Function(VoucherPackagesInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  VoucherPackagesInnerBuilder toBuilder() =>
      VoucherPackagesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherPackagesInner &&
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
    return (newBuiltValueToStringHelper(r'VoucherPackagesInner')
          ..add('id', id)
          ..add('name', name))
        .toString();
  }
}

class VoucherPackagesInnerBuilder
    implements Builder<VoucherPackagesInner, VoucherPackagesInnerBuilder> {
  _$VoucherPackagesInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  VoucherPackagesInnerBuilder() {
    VoucherPackagesInner._defaults(this);
  }

  VoucherPackagesInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherPackagesInner other) {
    _$v = other as _$VoucherPackagesInner;
  }

  @override
  void update(void Function(VoucherPackagesInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherPackagesInner build() => _build();

  _$VoucherPackagesInner _build() {
    final _$result =
        _$v ??
        _$VoucherPackagesInner._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'VoucherPackagesInner',
            'id',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'VoucherPackagesInner',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
