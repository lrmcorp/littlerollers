//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/class_type_branch_scopes_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_type.g.dart';

/// ClassType
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [description] 
/// * [modality] 
/// * [active] 
/// * [version] 
/// * [branchScopes] 
@BuiltValue()
abstract class ClassType implements Built<ClassType, ClassTypeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'modality')
  ClassTypeModalityEnum? get modality;
  // enum modalityEnum {  GROUP,  PRIVATE,  HYBRID,  UNKNOWN_LEGACY,  };

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'branchScopes')
  BuiltList<ClassTypeBranchScopesInner> get branchScopes;

  ClassType._();

  factory ClassType([void updates(ClassTypeBuilder b)]) = _$ClassType;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassTypeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassType> get serializer => _$ClassTypeSerializer();
}

class _$ClassTypeSerializer implements PrimitiveSerializer<ClassType> {
  @override
  final Iterable<Type> types = const [ClassType, _$ClassType];

  @override
  final String wireName = r'ClassType';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.modality != null) {
      yield r'modality';
      yield serializers.serialize(
        object.modality,
        specifiedType: const FullType(ClassTypeModalityEnum),
      );
    }
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'branchScopes';
    yield serializers.serialize(
      object.branchScopes,
      specifiedType: const FullType(BuiltList, [FullType(ClassTypeBranchScopesInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassTypeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        case r'modality':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ClassTypeModalityEnum),
          ) as ClassTypeModalityEnum;
          result.modality = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'branchScopes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ClassTypeBranchScopesInner)]),
          ) as BuiltList<ClassTypeBranchScopesInner>;
          result.branchScopes.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassType deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassTypeBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class ClassTypeModalityEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GROUP')
  static const ClassTypeModalityEnum GROUP = _$classTypeModalityEnum_GROUP;
  @BuiltValueEnumConst(wireName: r'PRIVATE')
  static const ClassTypeModalityEnum PRIVATE = _$classTypeModalityEnum_PRIVATE;
  @BuiltValueEnumConst(wireName: r'HYBRID')
  static const ClassTypeModalityEnum HYBRID = _$classTypeModalityEnum_HYBRID;
  @BuiltValueEnumConst(wireName: r'UNKNOWN_LEGACY')
  static const ClassTypeModalityEnum UNKNOWN_LEGACY = _$classTypeModalityEnum_UNKNOWN_LEGACY;

  static Serializer<ClassTypeModalityEnum> get serializer => _$classTypeModalityEnumSerializer;

  const ClassTypeModalityEnum._(String name): super(name);

  static BuiltSet<ClassTypeModalityEnum> get values => _$classTypeModalityEnumValues;
  static ClassTypeModalityEnum valueOf(String name) => _$classTypeModalityEnumValueOf(name);
}

