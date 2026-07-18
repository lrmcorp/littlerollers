//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'action_command.g.dart';

/// ActionCommand
///
/// Properties:
/// * [instructorUserId] 
/// * [reason] 
/// * [expectedVersion] 
@BuiltValue()
abstract class ActionCommand implements Built<ActionCommand, ActionCommandBuilder> {
  @BuiltValueField(wireName: r'instructorUserId')
  String? get instructorUserId;

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  @BuiltValueField(wireName: r'expectedVersion')
  int? get expectedVersion;

  ActionCommand._();

  factory ActionCommand([void updates(ActionCommandBuilder b)]) = _$ActionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ActionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ActionCommand> get serializer => _$ActionCommandSerializer();
}

class _$ActionCommandSerializer implements PrimitiveSerializer<ActionCommand> {
  @override
  final Iterable<Type> types = const [ActionCommand, _$ActionCommand];

  @override
  final String wireName = r'ActionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ActionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.instructorUserId != null) {
      yield r'instructorUserId';
      yield serializers.serialize(
        object.instructorUserId,
        specifiedType: const FullType(String),
      );
    }
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
    if (object.expectedVersion != null) {
      yield r'expectedVersion';
      yield serializers.serialize(
        object.expectedVersion,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ActionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ActionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.instructorUserId = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ActionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ActionCommandBuilder();
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

