//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/notification_occurrence.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_occurrence_page.g.dart';

/// NotificationOccurrencePage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class NotificationOccurrencePage implements Built<NotificationOccurrencePage, NotificationOccurrencePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<NotificationOccurrence> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  NotificationOccurrencePage._();

  factory NotificationOccurrencePage([void updates(NotificationOccurrencePageBuilder b)]) = _$NotificationOccurrencePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(NotificationOccurrencePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<NotificationOccurrencePage> get serializer => _$NotificationOccurrencePageSerializer();
}

class _$NotificationOccurrencePageSerializer implements PrimitiveSerializer<NotificationOccurrencePage> {
  @override
  final Iterable<Type> types = const [NotificationOccurrencePage, _$NotificationOccurrencePage];

  @override
  final String wireName = r'NotificationOccurrencePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    NotificationOccurrencePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(NotificationOccurrence)]),
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
    NotificationOccurrencePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required NotificationOccurrencePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(NotificationOccurrence)]),
          ) as BuiltList<NotificationOccurrence>;
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
  NotificationOccurrencePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = NotificationOccurrencePageBuilder();
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

