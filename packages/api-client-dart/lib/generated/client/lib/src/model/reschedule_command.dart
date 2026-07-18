//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_command.g.dart';

/// RescheduleCommand
///
/// Properties:
/// * [bookingId] 
/// * [targetClassSlotId] 
/// * [reason] 
@BuiltValue()
abstract class RescheduleCommand implements Built<RescheduleCommand, RescheduleCommandBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'targetClassSlotId')
  String get targetClassSlotId;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  RescheduleCommand._();

  factory RescheduleCommand([void updates(RescheduleCommandBuilder b)]) = _$RescheduleCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RescheduleCommand> get serializer => _$RescheduleCommandSerializer();
}

class _$RescheduleCommandSerializer implements PrimitiveSerializer<RescheduleCommand> {
  @override
  final Iterable<Type> types = const [RescheduleCommand, _$RescheduleCommand];

  @override
  final String wireName = r'RescheduleCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RescheduleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'targetClassSlotId';
    yield serializers.serialize(
      object.targetClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RescheduleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'targetClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.targetClassSlotId = valueDes;
          break;
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
  RescheduleCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleCommandBuilder();
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

