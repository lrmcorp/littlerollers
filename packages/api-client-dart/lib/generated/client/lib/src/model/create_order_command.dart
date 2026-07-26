//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_order_command.g.dart';

/// CreateOrderCommand
///
/// Properties:
/// * [packageId] 
/// * [slotId] 
@BuiltValue()
abstract class CreateOrderCommand implements Built<CreateOrderCommand, CreateOrderCommandBuilder> {
  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'slotId')
  String? get slotId;

  CreateOrderCommand._();

  factory CreateOrderCommand([void updates(CreateOrderCommandBuilder b)]) = _$CreateOrderCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateOrderCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateOrderCommand> get serializer => _$CreateOrderCommandSerializer();
}

class _$CreateOrderCommandSerializer implements PrimitiveSerializer<CreateOrderCommand> {
  @override
  final Iterable<Type> types = const [CreateOrderCommand, _$CreateOrderCommand];

  @override
  final String wireName = r'CreateOrderCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateOrderCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    if (object.slotId != null) {
      yield r'slotId';
      yield serializers.serialize(
        object.slotId,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateOrderCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateOrderCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'slotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.slotId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateOrderCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateOrderCommandBuilder();
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

