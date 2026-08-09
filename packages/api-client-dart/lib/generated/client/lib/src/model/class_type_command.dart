//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_type_command.g.dart';

/// ClassTypeCommand
///
/// Properties:
/// * [code] 
/// * [name] 
/// * [description] 
/// * [modality] 
/// * [defaultDurationMinutes] 
/// * [defaultMinimumQuota] 
/// * [defaultCapacity] 
/// * [branchIds] 
@BuiltValue()
abstract class ClassTypeCommand implements Built<ClassTypeCommand, ClassTypeCommandBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'modality')
  ClassTypeCommandModalityEnum? get modality;
  // enum modalityEnum {  GROUP,  PRIVATE,  HYBRID,  UNKNOWN_LEGACY,  };

  @BuiltValueField(wireName: r'defaultDurationMinutes')
  int? get defaultDurationMinutes;

  @BuiltValueField(wireName: r'defaultMinimumQuota')
  int? get defaultMinimumQuota;

  @BuiltValueField(wireName: r'defaultCapacity')
  int? get defaultCapacity;

  @BuiltValueField(wireName: r'branchIds')
  BuiltSet<String>? get branchIds;

  ClassTypeCommand._();

  factory ClassTypeCommand([void updates(ClassTypeCommandBuilder b)]) = _$ClassTypeCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassTypeCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassTypeCommand> get serializer => _$ClassTypeCommandSerializer();
}

class _$ClassTypeCommandSerializer implements PrimitiveSerializer<ClassTypeCommand> {
  @override
  final Iterable<Type> types = const [ClassTypeCommand, _$ClassTypeCommand];

  @override
  final String wireName = r'ClassTypeCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassTypeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
        specifiedType: const FullType(ClassTypeCommandModalityEnum),
      );
    }
    if (object.defaultDurationMinutes != null) {
      yield r'defaultDurationMinutes';
      yield serializers.serialize(
        object.defaultDurationMinutes,
        specifiedType: const FullType(int),
      );
    }
    if (object.defaultMinimumQuota != null) {
      yield r'defaultMinimumQuota';
      yield serializers.serialize(
        object.defaultMinimumQuota,
        specifiedType: const FullType(int),
      );
    }
    if (object.defaultCapacity != null) {
      yield r'defaultCapacity';
      yield serializers.serialize(
        object.defaultCapacity,
        specifiedType: const FullType(int),
      );
    }
    if (object.branchIds != null) {
      yield r'branchIds';
      yield serializers.serialize(
        object.branchIds,
        specifiedType: const FullType(BuiltSet, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassTypeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassTypeCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(ClassTypeCommandModalityEnum),
          ) as ClassTypeCommandModalityEnum;
          result.modality = valueDes;
          break;
        case r'defaultDurationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.defaultDurationMinutes = valueDes;
          break;
        case r'defaultMinimumQuota':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.defaultMinimumQuota = valueDes;
          break;
        case r'defaultCapacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.defaultCapacity = valueDes;
          break;
        case r'branchIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.branchIds.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassTypeCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassTypeCommandBuilder();
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

class ClassTypeCommandModalityEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GROUP')
  static const ClassTypeCommandModalityEnum GROUP = _$classTypeCommandModalityEnum_GROUP;
  @BuiltValueEnumConst(wireName: r'PRIVATE')
  static const ClassTypeCommandModalityEnum PRIVATE = _$classTypeCommandModalityEnum_PRIVATE;
  @BuiltValueEnumConst(wireName: r'HYBRID')
  static const ClassTypeCommandModalityEnum HYBRID = _$classTypeCommandModalityEnum_HYBRID;
  @BuiltValueEnumConst(wireName: r'UNKNOWN_LEGACY')
  static const ClassTypeCommandModalityEnum UNKNOWN_LEGACY = _$classTypeCommandModalityEnum_UNKNOWN_LEGACY;

  static Serializer<ClassTypeCommandModalityEnum> get serializer => _$classTypeCommandModalityEnumSerializer;

  const ClassTypeCommandModalityEnum._(String name): super(name);

  static BuiltSet<ClassTypeCommandModalityEnum> get values => _$classTypeCommandModalityEnumValues;
  static ClassTypeCommandModalityEnum valueOf(String name) => _$classTypeCommandModalityEnumValueOf(name);
}

