//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/user_summary.dart';
import 'package:openapi/src/model/user_list_summary.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_page.g.dart';

/// UserPage
///
/// Properties:
/// * [items] 
/// * [page] 
/// * [summary] 
@BuiltValue()
abstract class UserPage implements Built<UserPage, UserPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<UserSummary> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  @BuiltValueField(wireName: r'summary')
  UserListSummary get summary;

  UserPage._();

  factory UserPage([void updates(UserPageBuilder b)]) = _$UserPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserPage> get serializer => _$UserPageSerializer();
}

class _$UserPageSerializer implements PrimitiveSerializer<UserPage> {
  @override
  final Iterable<Type> types = const [UserPage, _$UserPage];

  @override
  final String wireName = r'UserPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(UserSummary)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(CursorPageMeta),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(UserListSummary),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserSummary)]),
          ) as BuiltList<UserSummary>;
          result.items.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CursorPageMeta),
          ) as CursorPageMeta;
          result.page.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserListSummary),
          ) as UserListSummary;
          result.summary.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserPageBuilder();
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

