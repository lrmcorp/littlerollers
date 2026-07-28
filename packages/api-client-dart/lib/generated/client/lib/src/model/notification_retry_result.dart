//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_retry_result.g.dart';

/// NotificationRetryResult
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [nextAttemptAt] 
@BuiltValue()
abstract class NotificationRetryResult implements Built<NotificationRetryResult, NotificationRetryResultBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  @BuiltValueField(wireName: r'nextAttemptAt')
  DateTime get nextAttemptAt;

  NotificationRetryResult._();

  factory NotificationRetryResult([void updates(NotificationRetryResultBuilder b)]) = _$NotificationRetryResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(NotificationRetryResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<NotificationRetryResult> get serializer => _$NotificationRetryResultSerializer();
}

class _$NotificationRetryResultSerializer implements PrimitiveSerializer<NotificationRetryResult> {
  @override
  final Iterable<Type> types = const [NotificationRetryResult, _$NotificationRetryResult];

  @override
  final String wireName = r'NotificationRetryResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    NotificationRetryResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'nextAttemptAt';
    yield serializers.serialize(
      object.nextAttemptAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    NotificationRetryResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required NotificationRetryResultBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'nextAttemptAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.nextAttemptAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  NotificationRetryResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = NotificationRetryResultBuilder();
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

