// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_named_reference.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdjustmentNamedReference extends AdjustmentNamedReference {
  @override
  final String id;
  @override
  final String name;

  factory _$AdjustmentNamedReference([
    void Function(AdjustmentNamedReferenceBuilder)? updates,
  ]) => (AdjustmentNamedReferenceBuilder()..update(updates))._build();

  _$AdjustmentNamedReference._({required this.id, required this.name})
    : super._();
  @override
  AdjustmentNamedReference rebuild(
    void Function(AdjustmentNamedReferenceBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AdjustmentNamedReferenceBuilder toBuilder() =>
      AdjustmentNamedReferenceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentNamedReference &&
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
    return (newBuiltValueToStringHelper(r'AdjustmentNamedReference')
          ..add('id', id)
          ..add('name', name))
        .toString();
  }
}

class AdjustmentNamedReferenceBuilder
    implements
        Builder<AdjustmentNamedReference, AdjustmentNamedReferenceBuilder> {
  _$AdjustmentNamedReference? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  AdjustmentNamedReferenceBuilder() {
    AdjustmentNamedReference._defaults(this);
  }

  AdjustmentNamedReferenceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdjustmentNamedReference other) {
    _$v = other as _$AdjustmentNamedReference;
  }

  @override
  void update(void Function(AdjustmentNamedReferenceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentNamedReference build() => _build();

  _$AdjustmentNamedReference _build() {
    final _$result =
        _$v ??
        _$AdjustmentNamedReference._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AdjustmentNamedReference',
            'id',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'AdjustmentNamedReference',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
