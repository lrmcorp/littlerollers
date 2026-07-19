// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_setting.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EffectiveSettingKindEnum _$effectiveSettingKindEnum_INSTRUCTOR_FEE =
    const EffectiveSettingKindEnum._('INSTRUCTOR_FEE');
const EffectiveSettingKindEnum _$effectiveSettingKindEnum_PROJECTION_RATE =
    const EffectiveSettingKindEnum._('PROJECTION_RATE');
const EffectiveSettingKindEnum _$effectiveSettingKindEnum_QUOTA_CAPACITY =
    const EffectiveSettingKindEnum._('QUOTA_CAPACITY');

EffectiveSettingKindEnum _$effectiveSettingKindEnumValueOf(String name) {
  switch (name) {
    case 'INSTRUCTOR_FEE':
      return _$effectiveSettingKindEnum_INSTRUCTOR_FEE;
    case 'PROJECTION_RATE':
      return _$effectiveSettingKindEnum_PROJECTION_RATE;
    case 'QUOTA_CAPACITY':
      return _$effectiveSettingKindEnum_QUOTA_CAPACITY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EffectiveSettingKindEnum> _$effectiveSettingKindEnumValues =
    BuiltSet<EffectiveSettingKindEnum>(const <EffectiveSettingKindEnum>[
      _$effectiveSettingKindEnum_INSTRUCTOR_FEE,
      _$effectiveSettingKindEnum_PROJECTION_RATE,
      _$effectiveSettingKindEnum_QUOTA_CAPACITY,
    ]);

Serializer<EffectiveSettingKindEnum> _$effectiveSettingKindEnumSerializer =
    _$EffectiveSettingKindEnumSerializer();

class _$EffectiveSettingKindEnumSerializer
    implements PrimitiveSerializer<EffectiveSettingKindEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'INSTRUCTOR_FEE': 'INSTRUCTOR_FEE',
    'PROJECTION_RATE': 'PROJECTION_RATE',
    'QUOTA_CAPACITY': 'QUOTA_CAPACITY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'INSTRUCTOR_FEE': 'INSTRUCTOR_FEE',
    'PROJECTION_RATE': 'PROJECTION_RATE',
    'QUOTA_CAPACITY': 'QUOTA_CAPACITY',
  };

  @override
  final Iterable<Type> types = const <Type>[EffectiveSettingKindEnum];
  @override
  final String wireName = 'EffectiveSettingKindEnum';

  @override
  Object serialize(
    Serializers serializers,
    EffectiveSettingKindEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  EffectiveSettingKindEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => EffectiveSettingKindEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$EffectiveSetting extends EffectiveSetting {
  @override
  final String id;
  @override
  final EffectiveSettingKindEnum kind;
  @override
  final String businessKey;
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final JsonObject value;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final int version;

  factory _$EffectiveSetting([
    void Function(EffectiveSettingBuilder)? updates,
  ]) => (EffectiveSettingBuilder()..update(updates))._build();

  _$EffectiveSetting._({
    required this.id,
    required this.kind,
    required this.businessKey,
    required this.branchId,
    required this.classTypeId,
    required this.value,
    required this.effectiveFrom,
    this.effectiveUntil,
    required this.version,
  }) : super._();
  @override
  EffectiveSetting rebuild(void Function(EffectiveSettingBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EffectiveSettingBuilder toBuilder() =>
      EffectiveSettingBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EffectiveSetting &&
        id == other.id &&
        kind == other.kind &&
        businessKey == other.businessKey &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        value == other.value &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, businessKey.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, value.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EffectiveSetting')
          ..add('id', id)
          ..add('kind', kind)
          ..add('businessKey', businessKey)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('value', value)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('version', version))
        .toString();
  }
}

class EffectiveSettingBuilder
    implements Builder<EffectiveSetting, EffectiveSettingBuilder> {
  _$EffectiveSetting? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  EffectiveSettingKindEnum? _kind;
  EffectiveSettingKindEnum? get kind => _$this._kind;
  set kind(EffectiveSettingKindEnum? kind) => _$this._kind = kind;

  String? _businessKey;
  String? get businessKey => _$this._businessKey;
  set businessKey(String? businessKey) => _$this._businessKey = businessKey;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  JsonObject? _value;
  JsonObject? get value => _$this._value;
  set value(JsonObject? value) => _$this._value = value;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  EffectiveSettingBuilder() {
    EffectiveSetting._defaults(this);
  }

  EffectiveSettingBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _businessKey = $v.businessKey;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _value = $v.value;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EffectiveSetting other) {
    _$v = other as _$EffectiveSetting;
  }

  @override
  void update(void Function(EffectiveSettingBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EffectiveSetting build() => _build();

  _$EffectiveSetting _build() {
    final _$result =
        _$v ??
        _$EffectiveSetting._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'EffectiveSetting',
            'id',
          ),
          kind: BuiltValueNullFieldError.checkNotNull(
            kind,
            r'EffectiveSetting',
            'kind',
          ),
          businessKey: BuiltValueNullFieldError.checkNotNull(
            businessKey,
            r'EffectiveSetting',
            'businessKey',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'EffectiveSetting',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'EffectiveSetting',
            'classTypeId',
          ),
          value: BuiltValueNullFieldError.checkNotNull(
            value,
            r'EffectiveSetting',
            'value',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'EffectiveSetting',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'EffectiveSetting',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
