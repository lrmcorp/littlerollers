//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'effective_capability_denial.g.dart';

/// EffectiveCapabilityDenial
///
/// Properties:
/// * [capability] 
/// * [branchId] 
/// * [sourceId] 
@BuiltValue()
abstract class EffectiveCapabilityDenial implements Built<EffectiveCapabilityDenial, EffectiveCapabilityDenialBuilder> {
  @BuiltValueField(wireName: r'capability')
  String get capability;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'sourceId')
  String get sourceId;

  EffectiveCapabilityDenial._();

  factory EffectiveCapabilityDenial([void updates(EffectiveCapabilityDenialBuilder b)]) = _$EffectiveCapabilityDenial;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EffectiveCapabilityDenialBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EffectiveCapabilityDenial> get serializer => _$EffectiveCapabilityDenialSerializer();
}

class _$EffectiveCapabilityDenialSerializer implements PrimitiveSerializer<EffectiveCapabilityDenial> {
  @override
  final Iterable<Type> types = const [EffectiveCapabilityDenial, _$EffectiveCapabilityDenial];

  @override
  final String wireName = r'EffectiveCapabilityDenial';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EffectiveCapabilityDenial object, {
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
    yield r'sourceId';
    yield serializers.serialize(
      object.sourceId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EffectiveCapabilityDenial object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EffectiveCapabilityDenialBuilder result,
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
  EffectiveCapabilityDenial deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EffectiveCapabilityDenialBuilder();
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

