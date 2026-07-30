// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_target_projection.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuditTargetProjection extends AuditTargetProjection {
  @override
  final String id;
  @override
  final String displayName;

  factory _$AuditTargetProjection([
    void Function(AuditTargetProjectionBuilder)? updates,
  ]) => (AuditTargetProjectionBuilder()..update(updates))._build();

  _$AuditTargetProjection._({required this.id, required this.displayName})
    : super._();
  @override
  AuditTargetProjection rebuild(
    void Function(AuditTargetProjectionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuditTargetProjectionBuilder toBuilder() =>
      AuditTargetProjectionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditTargetProjection &&
        id == other.id &&
        displayName == other.displayName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuditTargetProjection')
          ..add('id', id)
          ..add('displayName', displayName))
        .toString();
  }
}

class AuditTargetProjectionBuilder
    implements Builder<AuditTargetProjection, AuditTargetProjectionBuilder> {
  _$AuditTargetProjection? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  AuditTargetProjectionBuilder() {
    AuditTargetProjection._defaults(this);
  }

  AuditTargetProjectionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditTargetProjection other) {
    _$v = other as _$AuditTargetProjection;
  }

  @override
  void update(void Function(AuditTargetProjectionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditTargetProjection build() => _build();

  _$AuditTargetProjection _build() {
    final _$result =
        _$v ??
        _$AuditTargetProjection._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AuditTargetProjection',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'AuditTargetProjection',
            'displayName',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
