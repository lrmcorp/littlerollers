//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_notification.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_notification_page.g.dart';

/// UserNotificationPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class UserNotificationPage implements Built<UserNotificationPage, UserNotificationPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<UserNotification> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  UserNotificationPage._();

  factory UserNotificationPage([void updates(UserNotificationPageBuilder b)]) = _$UserNotificationPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserNotificationPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserNotificationPage> get serializer => _$UserNotificationPageSerializer();
}

class _$UserNotificationPageSerializer implements PrimitiveSerializer<UserNotificationPage> {
  @override
  final Iterable<Type> types = const [UserNotificationPage, _$UserNotificationPage];

  @override
  final String wireName = r'UserNotificationPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserNotificationPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(UserNotification)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(CursorPageMeta),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserNotificationPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserNotificationPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserNotification)]),
          ) as BuiltList<UserNotification>;
          result.items.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CursorPageMeta),
          ) as CursorPageMeta;
          result.page.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserNotificationPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserNotificationPageBuilder();
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

