// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_capability_denial.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EffectiveCapabilityDenial extends EffectiveCapabilityDenial {
  @override
  final String capability;
  @override
  final String? branchId;
  @override
  final String sourceId;

  factory _$EffectiveCapabilityDenial([
    void Function(EffectiveCapabilityDenialBuilder)? updates,
  ]) => (EffectiveCapabilityDenialBuilder()..update(updates))._build();

  _$EffectiveCapabilityDenial._({
    required this.capability,
    this.branchId,
    required this.sourceId,
  }) : super._();
  @override
  EffectiveCapabilityDenial rebuild(
    void Function(EffectiveCapabilityDenialBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  EffectiveCapabilityDenialBuilder toBuilder() =>
      EffectiveCapabilityDenialBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EffectiveCapabilityDenial &&
        capability == other.capability &&
        branchId == other.branchId &&
        sourceId == other.sourceId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, capability.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, sourceId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EffectiveCapabilityDenial')
          ..add('capability', capability)
          ..add('branchId', branchId)
          ..add('sourceId', sourceId))
        .toString();
  }
}

class EffectiveCapabilityDenialBuilder
    implements
        Builder<EffectiveCapabilityDenial, EffectiveCapabilityDenialBuilder> {
  _$EffectiveCapabilityDenial? _$v;

  String? _capability;
  String? get capability => _$this._capability;
  set capability(String? capability) => _$this._capability = capability;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _sourceId;
  String? get sourceId => _$this._sourceId;
  set sourceId(String? sourceId) => _$this._sourceId = sourceId;

  EffectiveCapabilityDenialBuilder() {
    EffectiveCapabilityDenial._defaults(this);
  }

  EffectiveCapabilityDenialBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _capability = $v.capability;
      _branchId = $v.branchId;
      _sourceId = $v.sourceId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EffectiveCapabilityDenial other) {
    _$v = other as _$EffectiveCapabilityDenial;
  }

  @override
  void update(void Function(EffectiveCapabilityDenialBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EffectiveCapabilityDenial build() => _build();

  _$EffectiveCapabilityDenial _build() {
    final _$result =
        _$v ??
        _$EffectiveCapabilityDenial._(
          capability: BuiltValueNullFieldError.checkNotNull(
            capability,
            r'EffectiveCapabilityDenial',
            'capability',
          ),
          branchId: branchId,
          sourceId: BuiltValueNullFieldError.checkNotNull(
            sourceId,
            r'EffectiveCapabilityDenial',
            'sourceId',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
