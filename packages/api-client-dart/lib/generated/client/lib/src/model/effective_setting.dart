//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'effective_setting.g.dart';

/// Immutable synthetic/non-production effective version using [effectiveFrom,effectiveUntil). Production values remain configuration-required.
///
/// Properties:
/// * [id] 
/// * [kind] 
/// * [businessKey] 
/// * [branchId] 
/// * [classTypeId] 
/// * [value] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [version] 
@BuiltValue()
abstract class EffectiveSetting implements Built<EffectiveSetting, EffectiveSettingBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'kind')
  EffectiveSettingKindEnum get kind;
  // enum kindEnum {  INSTRUCTOR_FEE,  PROJECTION_RATE,  QUOTA_CAPACITY,  };

  @BuiltValueField(wireName: r'businessKey')
  String get businessKey;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'value')
  JsonObject get value;

  @BuiltValueField(wireName: r'effectiveFrom')
  Date get effectiveFrom;

  @BuiltValueField(wireName: r'effectiveUntil')
  Date? get effectiveUntil;

  @BuiltValueField(wireName: r'version')
  int get version;

  EffectiveSetting._();

  factory EffectiveSetting([void updates(EffectiveSettingBuilder b)]) = _$EffectiveSetting;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EffectiveSettingBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EffectiveSetting> get serializer => _$EffectiveSettingSerializer();
}

class _$EffectiveSettingSerializer implements PrimitiveSerializer<EffectiveSetting> {
  @override
  final Iterable<Type> types = const [EffectiveSetting, _$EffectiveSetting];

  @override
  final String wireName = r'EffectiveSetting';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EffectiveSetting object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(EffectiveSettingKindEnum),
    );
    yield r'businessKey';
    yield serializers.serialize(
      object.businessKey,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'value';
    yield serializers.serialize(
      object.value,
      specifiedType: const FullType(JsonObject),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    yield r'effectiveUntil';
    yield object.effectiveUntil == null ? null : serializers.serialize(
      object.effectiveUntil,
      specifiedType: const FullType.nullable(Date),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EffectiveSetting object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EffectiveSettingBuilder result,
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
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EffectiveSettingKindEnum),
          ) as EffectiveSettingKindEnum;
          result.kind = valueDes;
          break;
        case r'businessKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.businessKey = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'value':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.value = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EffectiveSetting deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EffectiveSettingBuilder();
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

class EffectiveSettingKindEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_FEE')
  static const EffectiveSettingKindEnum INSTRUCTOR_FEE = _$effectiveSettingKindEnum_INSTRUCTOR_FEE;
  @BuiltValueEnumConst(wireName: r'PROJECTION_RATE')
  static const EffectiveSettingKindEnum PROJECTION_RATE = _$effectiveSettingKindEnum_PROJECTION_RATE;
  @BuiltValueEnumConst(wireName: r'QUOTA_CAPACITY')
  static const EffectiveSettingKindEnum QUOTA_CAPACITY = _$effectiveSettingKindEnum_QUOTA_CAPACITY;

  static Serializer<EffectiveSettingKindEnum> get serializer => _$effectiveSettingKindEnumSerializer;

  const EffectiveSettingKindEnum._(String name): super(name);

  static BuiltSet<EffectiveSettingKindEnum> get values => _$effectiveSettingKindEnumValues;
  static EffectiveSettingKindEnum valueOf(String name) => _$effectiveSettingKindEnumValueOf(name);
}

