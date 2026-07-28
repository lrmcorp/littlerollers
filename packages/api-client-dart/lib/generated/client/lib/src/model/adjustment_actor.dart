//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'adjustment_actor.g.dart';

/// AdjustmentActor
///
/// Properties:
/// * [id] 
/// * [displayName] 
@BuiltValue()
abstract class AdjustmentActor implements Built<AdjustmentActor, AdjustmentActorBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  AdjustmentActor._();

  factory AdjustmentActor([void updates(AdjustmentActorBuilder b)]) = _$AdjustmentActor;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdjustmentActorBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdjustmentActor> get serializer => _$AdjustmentActorSerializer();
}

class _$AdjustmentActorSerializer implements PrimitiveSerializer<AdjustmentActor> {
  @override
  final Iterable<Type> types = const [AdjustmentActor, _$AdjustmentActor];

  @override
  final String wireName = r'AdjustmentActor';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdjustmentActor object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdjustmentActor object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdjustmentActorBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdjustmentActor deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdjustmentActorBuilder();
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

