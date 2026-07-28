//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'effective_capability_grant.g.dart';

/// EffectiveCapabilityGrant
///
/// Properties:
/// * [capability] 
/// * [branchId] 
/// * [source_] 
/// * [sourceId] 
@BuiltValue()
abstract class EffectiveCapabilityGrant implements Built<EffectiveCapabilityGrant, EffectiveCapabilityGrantBuilder> {
  @BuiltValueField(wireName: r'capability')
  String get capability;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'source')
  EffectiveCapabilityGrantSource_Enum get source_;
  // enum source_Enum {  SYSTEM_ROLE,  CUSTOM_ROLE,  USER_OVERRIDE,  };

  @BuiltValueField(wireName: r'sourceId')
  String get sourceId;

  EffectiveCapabilityGrant._();

  factory EffectiveCapabilityGrant([void updates(EffectiveCapabilityGrantBuilder b)]) = _$EffectiveCapabilityGrant;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EffectiveCapabilityGrantBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EffectiveCapabilityGrant> get serializer => _$EffectiveCapabilityGrantSerializer();
}

class _$EffectiveCapabilityGrantSerializer implements PrimitiveSerializer<EffectiveCapabilityGrant> {
  @override
  final Iterable<Type> types = const [EffectiveCapabilityGrant, _$EffectiveCapabilityGrant];

  @override
  final String wireName = r'EffectiveCapabilityGrant';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EffectiveCapabilityGrant object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'capability';
    yield serializers.serialize(
      object.capability,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield object.branchId == null ? null : serializers.serialize(
      object.branchId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(EffectiveCapabilityGrantSource_Enum),
    );
    yield r'sourceId';
    yield serializers.serialize(
      object.sourceId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EffectiveCapabilityGrant object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EffectiveCapabilityGrantBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'capability':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.capability = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EffectiveCapabilityGrantSource_Enum),
          ) as EffectiveCapabilityGrantSource_Enum;
          result.source_ = valueDes;
          break;
        case r'sourceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EffectiveCapabilityGrant deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EffectiveCapabilityGrantBuilder();
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

class EffectiveCapabilityGrantSource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SYSTEM_ROLE')
  static const EffectiveCapabilityGrantSource_Enum SYSTEM_ROLE = _$effectiveCapabilityGrantSourceEnum_SYSTEM_ROLE;
  @BuiltValueEnumConst(wireName: r'CUSTOM_ROLE')
  static const EffectiveCapabilityGrantSource_Enum CUSTOM_ROLE = _$effectiveCapabilityGrantSourceEnum_CUSTOM_ROLE;
  @BuiltValueEnumConst(wireName: r'USER_OVERRIDE')
  static const EffectiveCapabilityGrantSource_Enum USER_OVERRIDE = _$effectiveCapabilityGrantSourceEnum_USER_OVERRIDE;

  static Serializer<EffectiveCapabilityGrantSource_Enum> get serializer => _$effectiveCapabilityGrantSourceEnumSerializer;

  const EffectiveCapabilityGrantSource_Enum._(String name): super(name);

  static BuiltSet<EffectiveCapabilityGrantSource_Enum> get values => _$effectiveCapabilityGrantSourceEnumValues;
  static EffectiveCapabilityGrantSource_Enum valueOf(String name) => _$effectiveCapabilityGrantSourceEnumValueOf(name);
}

