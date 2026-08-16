//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reason_command.g.dart';

/// ReasonCommand
///
/// Properties:
/// * [reason] 
@BuiltValue()
abstract class ReasonCommand implements Built<ReasonCommand, ReasonCommandBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  ReasonCommand._();

  factory ReasonCommand([void updates(ReasonCommandBuilder b)]) = _$ReasonCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReasonCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReasonCommand> get serializer => _$ReasonCommandSerializer();
}

class _$ReasonCommandSerializer implements PrimitiveSerializer<ReasonCommand> {
  @override
  final Iterable<Type> types = const [ReasonCommand, _$ReasonCommand];

  @override
  final String wireName = r'ReasonCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReasonCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReasonCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReasonCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReasonCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReasonCommandBuilder();
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

