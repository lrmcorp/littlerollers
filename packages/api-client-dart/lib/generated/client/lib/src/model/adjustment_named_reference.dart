//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'adjustment_named_reference.g.dart';

/// AdjustmentNamedReference
///
/// Properties:
/// * [id] 
/// * [name] 
@BuiltValue()
abstract class AdjustmentNamedReference implements Built<AdjustmentNamedReference, AdjustmentNamedReferenceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  AdjustmentNamedReference._();

  factory AdjustmentNamedReference([void updates(AdjustmentNamedReferenceBuilder b)]) = _$AdjustmentNamedReference;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdjustmentNamedReferenceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdjustmentNamedReference> get serializer => _$AdjustmentNamedReferenceSerializer();
}

class _$AdjustmentNamedReferenceSerializer implements PrimitiveSerializer<AdjustmentNamedReference> {
  @override
  final Iterable<Type> types = const [AdjustmentNamedReference, _$AdjustmentNamedReference];

  @override
  final String wireName = r'AdjustmentNamedReference';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdjustmentNamedReference object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdjustmentNamedReference object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdjustmentNamedReferenceBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdjustmentNamedReference deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdjustmentNamedReferenceBuilder();
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

