// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_actor.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdjustmentActor extends AdjustmentActor {
  @override
  final String id;
  @override
  final String displayName;

  factory _$AdjustmentActor([void Function(AdjustmentActorBuilder)? updates]) =>
      (AdjustmentActorBuilder()..update(updates))._build();

  _$AdjustmentActor._({required this.id, required this.displayName})
    : super._();
  @override
  AdjustmentActor rebuild(void Function(AdjustmentActorBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdjustmentActorBuilder toBuilder() => AdjustmentActorBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentActor &&
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
    return (newBuiltValueToStringHelper(r'AdjustmentActor')
          ..add('id', id)
          ..add('displayName', displayName))
        .toString();
  }
}

class AdjustmentActorBuilder
    implements Builder<AdjustmentActor, AdjustmentActorBuilder> {
  _$AdjustmentActor? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  AdjustmentActorBuilder() {
    AdjustmentActor._defaults(this);
  }

  AdjustmentActorBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdjustmentActor other) {
    _$v = other as _$AdjustmentActor;
  }

  @override
  void update(void Function(AdjustmentActorBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentActor build() => _build();

  _$AdjustmentActor _build() {
    final _$result =
        _$v ??
        _$AdjustmentActor._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AdjustmentActor',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'AdjustmentActor',
            'displayName',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
