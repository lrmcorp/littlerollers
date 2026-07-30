// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_actor_projection.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuditActorProjection extends AuditActorProjection {
  @override
  final String id;
  @override
  final String displayName;

  factory _$AuditActorProjection([
    void Function(AuditActorProjectionBuilder)? updates,
  ]) => (AuditActorProjectionBuilder()..update(updates))._build();

  _$AuditActorProjection._({required this.id, required this.displayName})
    : super._();
  @override
  AuditActorProjection rebuild(
    void Function(AuditActorProjectionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuditActorProjectionBuilder toBuilder() =>
      AuditActorProjectionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditActorProjection &&
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
    return (newBuiltValueToStringHelper(r'AuditActorProjection')
          ..add('id', id)
          ..add('displayName', displayName))
        .toString();
  }
}

class AuditActorProjectionBuilder
    implements Builder<AuditActorProjection, AuditActorProjectionBuilder> {
  _$AuditActorProjection? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  AuditActorProjectionBuilder() {
    AuditActorProjection._defaults(this);
  }

  AuditActorProjectionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditActorProjection other) {
    _$v = other as _$AuditActorProjection;
  }

  @override
  void update(void Function(AuditActorProjectionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditActorProjection build() => _build();

  _$AuditActorProjection _build() {
    final _$result =
        _$v ??
        _$AuditActorProjection._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AuditActorProjection',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'AuditActorProjection',
            'displayName',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
