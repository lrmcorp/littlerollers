// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_capability_grant.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EffectiveCapabilityGrantSource_Enum
_$effectiveCapabilityGrantSourceEnum_SYSTEM_ROLE =
    const EffectiveCapabilityGrantSource_Enum._('SYSTEM_ROLE');
const EffectiveCapabilityGrantSource_Enum
_$effectiveCapabilityGrantSourceEnum_CUSTOM_ROLE =
    const EffectiveCapabilityGrantSource_Enum._('CUSTOM_ROLE');
const EffectiveCapabilityGrantSource_Enum
_$effectiveCapabilityGrantSourceEnum_USER_OVERRIDE =
    const EffectiveCapabilityGrantSource_Enum._('USER_OVERRIDE');

EffectiveCapabilityGrantSource_Enum _$effectiveCapabilityGrantSourceEnumValueOf(
  String name,
) {
  switch (name) {
    case 'SYSTEM_ROLE':
      return _$effectiveCapabilityGrantSourceEnum_SYSTEM_ROLE;
    case 'CUSTOM_ROLE':
      return _$effectiveCapabilityGrantSourceEnum_CUSTOM_ROLE;
    case 'USER_OVERRIDE':
      return _$effectiveCapabilityGrantSourceEnum_USER_OVERRIDE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EffectiveCapabilityGrantSource_Enum>
_$effectiveCapabilityGrantSourceEnumValues =
    BuiltSet<EffectiveCapabilityGrantSource_Enum>(
      const <EffectiveCapabilityGrantSource_Enum>[
        _$effectiveCapabilityGrantSourceEnum_SYSTEM_ROLE,
        _$effectiveCapabilityGrantSourceEnum_CUSTOM_ROLE,
        _$effectiveCapabilityGrantSourceEnum_USER_OVERRIDE,
      ],
    );

Serializer<EffectiveCapabilityGrantSource_Enum>
_$effectiveCapabilityGrantSourceEnumSerializer =
    _$EffectiveCapabilityGrantSource_EnumSerializer();

class _$EffectiveCapabilityGrantSource_EnumSerializer
    implements PrimitiveSerializer<EffectiveCapabilityGrantSource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SYSTEM_ROLE': 'SYSTEM_ROLE',
    'CUSTOM_ROLE': 'CUSTOM_ROLE',
    'USER_OVERRIDE': 'USER_OVERRIDE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SYSTEM_ROLE': 'SYSTEM_ROLE',
    'CUSTOM_ROLE': 'CUSTOM_ROLE',
    'USER_OVERRIDE': 'USER_OVERRIDE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    EffectiveCapabilityGrantSource_Enum,
  ];
  @override
  final String wireName = 'EffectiveCapabilityGrantSource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    EffectiveCapabilityGrantSource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  EffectiveCapabilityGrantSource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => EffectiveCapabilityGrantSource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$EffectiveCapabilityGrant extends EffectiveCapabilityGrant {
  @override
  final String capability;
  @override
  final String? branchId;
  @override
  final EffectiveCapabilityGrantSource_Enum source_;
  @override
  final String sourceId;

  factory _$EffectiveCapabilityGrant([
    void Function(EffectiveCapabilityGrantBuilder)? updates,
  ]) => (EffectiveCapabilityGrantBuilder()..update(updates))._build();

  _$EffectiveCapabilityGrant._({
    required this.capability,
    this.branchId,
    required this.source_,
    required this.sourceId,
  }) : super._();
  @override
  EffectiveCapabilityGrant rebuild(
    void Function(EffectiveCapabilityGrantBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  EffectiveCapabilityGrantBuilder toBuilder() =>
      EffectiveCapabilityGrantBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EffectiveCapabilityGrant &&
        capability == other.capability &&
        branchId == other.branchId &&
        source_ == other.source_ &&
        sourceId == other.sourceId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, capability.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jc(_$hash, sourceId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EffectiveCapabilityGrant')
          ..add('capability', capability)
          ..add('branchId', branchId)
          ..add('source_', source_)
          ..add('sourceId', sourceId))
        .toString();
  }
}

class EffectiveCapabilityGrantBuilder
    implements
        Builder<EffectiveCapabilityGrant, EffectiveCapabilityGrantBuilder> {
  _$EffectiveCapabilityGrant? _$v;

  String? _capability;
  String? get capability => _$this._capability;
  set capability(String? capability) => _$this._capability = capability;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  EffectiveCapabilityGrantSource_Enum? _source_;
  EffectiveCapabilityGrantSource_Enum? get source_ => _$this._source_;
  set source_(EffectiveCapabilityGrantSource_Enum? source_) =>
      _$this._source_ = source_;

  String? _sourceId;
  String? get sourceId => _$this._sourceId;
  set sourceId(String? sourceId) => _$this._sourceId = sourceId;

  EffectiveCapabilityGrantBuilder() {
    EffectiveCapabilityGrant._defaults(this);
  }

  EffectiveCapabilityGrantBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _capability = $v.capability;
      _branchId = $v.branchId;
      _source_ = $v.source_;
      _sourceId = $v.sourceId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EffectiveCapabilityGrant other) {
    _$v = other as _$EffectiveCapabilityGrant;
  }

  @override
  void update(void Function(EffectiveCapabilityGrantBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EffectiveCapabilityGrant build() => _build();

  _$EffectiveCapabilityGrant _build() {
    final _$result =
        _$v ??
        _$EffectiveCapabilityGrant._(
          capability: BuiltValueNullFieldError.checkNotNull(
            capability,
            r'EffectiveCapabilityGrant',
            'capability',
          ),
          branchId: branchId,
          source_: BuiltValueNullFieldError.checkNotNull(
            source_,
            r'EffectiveCapabilityGrant',
            'source_',
          ),
          sourceId: BuiltValueNullFieldError.checkNotNull(
            sourceId,
            r'EffectiveCapabilityGrant',
            'sourceId',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
