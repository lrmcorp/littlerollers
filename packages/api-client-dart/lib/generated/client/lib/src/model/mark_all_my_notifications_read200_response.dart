//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mark_all_my_notifications_read200_response.g.dart';

/// MarkAllMyNotificationsRead200Response
///
/// Properties:
/// * [updatedCount] 
/// * [readAt] 
@BuiltValue()
abstract class MarkAllMyNotificationsRead200Response implements Built<MarkAllMyNotificationsRead200Response, MarkAllMyNotificationsRead200ResponseBuilder> {
  @BuiltValueField(wireName: r'updatedCount')
  int get updatedCount;

  @BuiltValueField(wireName: r'readAt')
  DateTime get readAt;

  MarkAllMyNotificationsRead200Response._();

  factory MarkAllMyNotificationsRead200Response([void updates(MarkAllMyNotificationsRead200ResponseBuilder b)]) = _$MarkAllMyNotificationsRead200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MarkAllMyNotificationsRead200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MarkAllMyNotificationsRead200Response> get serializer => _$MarkAllMyNotificationsRead200ResponseSerializer();
}

class _$MarkAllMyNotificationsRead200ResponseSerializer implements PrimitiveSerializer<MarkAllMyNotificationsRead200Response> {
  @override
  final Iterable<Type> types = const [MarkAllMyNotificationsRead200Response, _$MarkAllMyNotificationsRead200Response];

  @override
  final String wireName = r'MarkAllMyNotificationsRead200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MarkAllMyNotificationsRead200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'updatedCount';
    yield serializers.serialize(
      object.updatedCount,
      specifiedType: const FullType(int),
    );
    yield r'readAt';
    yield serializers.serialize(
      object.readAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MarkAllMyNotificationsRead200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MarkAllMyNotificationsRead200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'updatedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.updatedCount = valueDes;
          break;
        case r'readAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.readAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MarkAllMyNotificationsRead200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MarkAllMyNotificationsRead200ResponseBuilder();
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

