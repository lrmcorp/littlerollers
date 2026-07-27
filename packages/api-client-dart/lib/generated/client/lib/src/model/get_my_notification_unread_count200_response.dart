//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'get_my_notification_unread_count200_response.g.dart';

/// GetMyNotificationUnreadCount200Response
///
/// Properties:
/// * [count] 
@BuiltValue()
abstract class GetMyNotificationUnreadCount200Response implements Built<GetMyNotificationUnreadCount200Response, GetMyNotificationUnreadCount200ResponseBuilder> {
  @BuiltValueField(wireName: r'count')
  int get count;

  GetMyNotificationUnreadCount200Response._();

  factory GetMyNotificationUnreadCount200Response([void updates(GetMyNotificationUnreadCount200ResponseBuilder b)]) = _$GetMyNotificationUnreadCount200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(GetMyNotificationUnreadCount200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<GetMyNotificationUnreadCount200Response> get serializer => _$GetMyNotificationUnreadCount200ResponseSerializer();
}

class _$GetMyNotificationUnreadCount200ResponseSerializer implements PrimitiveSerializer<GetMyNotificationUnreadCount200Response> {
  @override
  final Iterable<Type> types = const [GetMyNotificationUnreadCount200Response, _$GetMyNotificationUnreadCount200Response];

  @override
  final String wireName = r'GetMyNotificationUnreadCount200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    GetMyNotificationUnreadCount200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'count';
    yield serializers.serialize(
      object.count,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    GetMyNotificationUnreadCount200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required GetMyNotificationUnreadCount200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.count = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  GetMyNotificationUnreadCount200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = GetMyNotificationUnreadCount200ResponseBuilder();
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

