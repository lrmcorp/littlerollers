//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/capability_definition.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'capability_definition_page.g.dart';

/// CapabilityDefinitionPage
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class CapabilityDefinitionPage implements Built<CapabilityDefinitionPage, CapabilityDefinitionPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<CapabilityDefinition> get items;

  CapabilityDefinitionPage._();

  factory CapabilityDefinitionPage([void updates(CapabilityDefinitionPageBuilder b)]) = _$CapabilityDefinitionPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CapabilityDefinitionPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CapabilityDefinitionPage> get serializer => _$CapabilityDefinitionPageSerializer();
}

class _$CapabilityDefinitionPageSerializer implements PrimitiveSerializer<CapabilityDefinitionPage> {
  @override
  final Iterable<Type> types = const [CapabilityDefinitionPage, _$CapabilityDefinitionPage];

  @override
  final String wireName = r'CapabilityDefinitionPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CapabilityDefinitionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(CapabilityDefinition)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CapabilityDefinitionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CapabilityDefinitionPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CapabilityDefinition)]),
          ) as BuiltList<CapabilityDefinition>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CapabilityDefinitionPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CapabilityDefinitionPageBuilder();
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

