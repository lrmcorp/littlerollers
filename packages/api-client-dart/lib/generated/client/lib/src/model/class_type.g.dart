// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ClassTypeModalityEnum _$classTypeModalityEnum_GROUP =
    const ClassTypeModalityEnum._('GROUP');
const ClassTypeModalityEnum _$classTypeModalityEnum_PRIVATE =
    const ClassTypeModalityEnum._('PRIVATE');
const ClassTypeModalityEnum _$classTypeModalityEnum_HYBRID =
    const ClassTypeModalityEnum._('HYBRID');
const ClassTypeModalityEnum _$classTypeModalityEnum_UNKNOWN_LEGACY =
    const ClassTypeModalityEnum._('UNKNOWN_LEGACY');

ClassTypeModalityEnum _$classTypeModalityEnumValueOf(String name) {
  switch (name) {
    case 'GROUP':
      return _$classTypeModalityEnum_GROUP;
    case 'PRIVATE':
      return _$classTypeModalityEnum_PRIVATE;
    case 'HYBRID':
      return _$classTypeModalityEnum_HYBRID;
    case 'UNKNOWN_LEGACY':
      return _$classTypeModalityEnum_UNKNOWN_LEGACY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ClassTypeModalityEnum> _$classTypeModalityEnumValues =
    BuiltSet<ClassTypeModalityEnum>(const <ClassTypeModalityEnum>[
      _$classTypeModalityEnum_GROUP,
      _$classTypeModalityEnum_PRIVATE,
      _$classTypeModalityEnum_HYBRID,
      _$classTypeModalityEnum_UNKNOWN_LEGACY,
    ]);

Serializer<ClassTypeModalityEnum> _$classTypeModalityEnumSerializer =
    _$ClassTypeModalityEnumSerializer();

class _$ClassTypeModalityEnumSerializer
    implements PrimitiveSerializer<ClassTypeModalityEnum> {
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
  final Iterable<Type> types = const <Type>[ClassTypeModalityEnum];
  @override
  final String wireName = 'ClassTypeModalityEnum';

  @override
  Object serialize(
    Serializers serializers,
    ClassTypeModalityEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ClassTypeModalityEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ClassTypeModalityEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ClassType extends ClassType {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String? description;
  @override
  final ClassTypeModalityEnum? modality;
  @override
  final bool active;
  @override
  final int version;
  @override
  final BuiltList<ClassTypeBranchScopesInner> branchScopes;

  factory _$ClassType([void Function(ClassTypeBuilder)? updates]) =>
      (ClassTypeBuilder()..update(updates))._build();

  _$ClassType._({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    this.modality,
    required this.active,
    required this.version,
    required this.branchScopes,
  }) : super._();
  @override
  ClassType rebuild(void Function(ClassTypeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassTypeBuilder toBuilder() => ClassTypeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassType &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        description == other.description &&
        modality == other.modality &&
        active == other.active &&
        version == other.version &&
        branchScopes == other.branchScopes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, modality.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, branchScopes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassType')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('description', description)
          ..add('modality', modality)
          ..add('active', active)
          ..add('version', version)
          ..add('branchScopes', branchScopes))
        .toString();
  }
}

class ClassTypeBuilder implements Builder<ClassType, ClassTypeBuilder> {
  _$ClassType? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ClassTypeModalityEnum? _modality;
  ClassTypeModalityEnum? get modality => _$this._modality;
  set modality(ClassTypeModalityEnum? modality) => _$this._modality = modality;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  ListBuilder<ClassTypeBranchScopesInner>? _branchScopes;
  ListBuilder<ClassTypeBranchScopesInner> get branchScopes =>
      _$this._branchScopes ??= ListBuilder<ClassTypeBranchScopesInner>();
  set branchScopes(ListBuilder<ClassTypeBranchScopesInner>? branchScopes) =>
      _$this._branchScopes = branchScopes;

  ClassTypeBuilder() {
    ClassType._defaults(this);
  }

  ClassTypeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _description = $v.description;
      _modality = $v.modality;
      _active = $v.active;
      _version = $v.version;
      _branchScopes = $v.branchScopes.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassType other) {
    _$v = other as _$ClassType;
  }

  @override
  void update(void Function(ClassTypeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassType build() => _build();

  _$ClassType _build() {
    _$ClassType _$result;
    try {
      _$result =
          _$v ??
          _$ClassType._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'ClassType', 'id'),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'ClassType',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'ClassType',
              'name',
            ),
            description: description,
            modality: modality,
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'ClassType',
              'active',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'ClassType',
              'version',
            ),
            branchScopes: branchScopes.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchScopes';
        branchScopes.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ClassType',
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
