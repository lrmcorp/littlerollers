// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ClassTypeCommandModalityEnum _$classTypeCommandModalityEnum_GROUP =
    const ClassTypeCommandModalityEnum._('GROUP');
const ClassTypeCommandModalityEnum _$classTypeCommandModalityEnum_PRIVATE =
    const ClassTypeCommandModalityEnum._('PRIVATE');
const ClassTypeCommandModalityEnum _$classTypeCommandModalityEnum_HYBRID =
    const ClassTypeCommandModalityEnum._('HYBRID');
const ClassTypeCommandModalityEnum
_$classTypeCommandModalityEnum_UNKNOWN_LEGACY =
    const ClassTypeCommandModalityEnum._('UNKNOWN_LEGACY');

ClassTypeCommandModalityEnum _$classTypeCommandModalityEnumValueOf(
  String name,
) {
  switch (name) {
    case 'GROUP':
      return _$classTypeCommandModalityEnum_GROUP;
    case 'PRIVATE':
      return _$classTypeCommandModalityEnum_PRIVATE;
    case 'HYBRID':
      return _$classTypeCommandModalityEnum_HYBRID;
    case 'UNKNOWN_LEGACY':
      return _$classTypeCommandModalityEnum_UNKNOWN_LEGACY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ClassTypeCommandModalityEnum>
_$classTypeCommandModalityEnumValues =
    BuiltSet<ClassTypeCommandModalityEnum>(const <ClassTypeCommandModalityEnum>[
      _$classTypeCommandModalityEnum_GROUP,
      _$classTypeCommandModalityEnum_PRIVATE,
      _$classTypeCommandModalityEnum_HYBRID,
      _$classTypeCommandModalityEnum_UNKNOWN_LEGACY,
    ]);

Serializer<ClassTypeCommandModalityEnum>
_$classTypeCommandModalityEnumSerializer =
    _$ClassTypeCommandModalityEnumSerializer();

class _$ClassTypeCommandModalityEnumSerializer
    implements PrimitiveSerializer<ClassTypeCommandModalityEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GROUP': 'GROUP',
    'PRIVATE': 'PRIVATE',
    'HYBRID': 'HYBRID',
    'UNKNOWN_LEGACY': 'UNKNOWN_LEGACY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GROUP': 'GROUP',
    'PRIVATE': 'PRIVATE',
    'HYBRID': 'HYBRID',
    'UNKNOWN_LEGACY': 'UNKNOWN_LEGACY',
  };

  @override
  final Iterable<Type> types = const <Type>[ClassTypeCommandModalityEnum];
  @override
  final String wireName = 'ClassTypeCommandModalityEnum';

  @override
  Object serialize(
    Serializers serializers,
    ClassTypeCommandModalityEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ClassTypeCommandModalityEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ClassTypeCommandModalityEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ClassTypeCommand extends ClassTypeCommand {
  @override
  final String code;
  @override
  final String name;
  @override
  final String? description;
  @override
  final ClassTypeCommandModalityEnum? modality;
  @override
  final int? defaultDurationMinutes;
  @override
  final int? defaultMinimumQuota;
  @override
  final int? defaultCapacity;
  @override
  final BuiltSet<String>? branchIds;

  factory _$ClassTypeCommand([
    void Function(ClassTypeCommandBuilder)? updates,
  ]) => (ClassTypeCommandBuilder()..update(updates))._build();

  _$ClassTypeCommand._({
    required this.code,
    required this.name,
    this.description,
    this.modality,
    this.defaultDurationMinutes,
    this.defaultMinimumQuota,
    this.defaultCapacity,
    this.branchIds,
  }) : super._();
  @override
  ClassTypeCommand rebuild(void Function(ClassTypeCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassTypeCommandBuilder toBuilder() =>
      ClassTypeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypeCommand &&
        code == other.code &&
        name == other.name &&
        description == other.description &&
        modality == other.modality &&
        defaultDurationMinutes == other.defaultDurationMinutes &&
        defaultMinimumQuota == other.defaultMinimumQuota &&
        defaultCapacity == other.defaultCapacity &&
        branchIds == other.branchIds;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, modality.hashCode);
    _$hash = $jc(_$hash, defaultDurationMinutes.hashCode);
    _$hash = $jc(_$hash, defaultMinimumQuota.hashCode);
    _$hash = $jc(_$hash, defaultCapacity.hashCode);
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassTypeCommand')
          ..add('code', code)
          ..add('name', name)
          ..add('description', description)
          ..add('modality', modality)
          ..add('defaultDurationMinutes', defaultDurationMinutes)
          ..add('defaultMinimumQuota', defaultMinimumQuota)
          ..add('defaultCapacity', defaultCapacity)
          ..add('branchIds', branchIds))
        .toString();
  }
}

class ClassTypeCommandBuilder
    implements Builder<ClassTypeCommand, ClassTypeCommandBuilder> {
  _$ClassTypeCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ClassTypeCommandModalityEnum? _modality;
  ClassTypeCommandModalityEnum? get modality => _$this._modality;
  set modality(ClassTypeCommandModalityEnum? modality) =>
      _$this._modality = modality;

  int? _defaultDurationMinutes;
  int? get defaultDurationMinutes => _$this._defaultDurationMinutes;
  set defaultDurationMinutes(int? defaultDurationMinutes) =>
      _$this._defaultDurationMinutes = defaultDurationMinutes;

  int? _defaultMinimumQuota;
  int? get defaultMinimumQuota => _$this._defaultMinimumQuota;
  set defaultMinimumQuota(int? defaultMinimumQuota) =>
      _$this._defaultMinimumQuota = defaultMinimumQuota;

  int? _defaultCapacity;
  int? get defaultCapacity => _$this._defaultCapacity;
  set defaultCapacity(int? defaultCapacity) =>
      _$this._defaultCapacity = defaultCapacity;

  SetBuilder<String>? _branchIds;
  SetBuilder<String> get branchIds =>
      _$this._branchIds ??= SetBuilder<String>();
  set branchIds(SetBuilder<String>? branchIds) => _$this._branchIds = branchIds;

  ClassTypeCommandBuilder() {
    ClassTypeCommand._defaults(this);
  }

  ClassTypeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _description = $v.description;
      _modality = $v.modality;
      _defaultDurationMinutes = $v.defaultDurationMinutes;
      _defaultMinimumQuota = $v.defaultMinimumQuota;
      _defaultCapacity = $v.defaultCapacity;
      _branchIds = $v.branchIds?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypeCommand other) {
    _$v = other as _$ClassTypeCommand;
  }

  @override
  void update(void Function(ClassTypeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypeCommand build() => _build();

  _$ClassTypeCommand _build() {
    _$ClassTypeCommand _$result;
    try {
      _$result =
          _$v ??
          _$ClassTypeCommand._(
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'ClassTypeCommand',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'ClassTypeCommand',
              'name',
            ),
            description: description,
            modality: modality,
            defaultDurationMinutes: defaultDurationMinutes,
            defaultMinimumQuota: defaultMinimumQuota,
            defaultCapacity: defaultCapacity,
            branchIds: _branchIds?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchIds';
        _branchIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ClassTypeCommand',
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
