//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_order_timeline_item.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_order_timeline_page.g.dart';

/// CustomerOrderTimelinePage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class CustomerOrderTimelinePage implements Built<CustomerOrderTimelinePage, CustomerOrderTimelinePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<CustomerOrderTimelineItem> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  CustomerOrderTimelinePage._();

  factory CustomerOrderTimelinePage([void updates(CustomerOrderTimelinePageBuilder b)]) = _$CustomerOrderTimelinePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerOrderTimelinePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerOrderTimelinePage> get serializer => _$CustomerOrderTimelinePageSerializer();
}

class _$CustomerOrderTimelinePageSerializer implements PrimitiveSerializer<CustomerOrderTimelinePage> {
  @override
  final Iterable<Type> types = const [CustomerOrderTimelinePage, _$CustomerOrderTimelinePage];

  @override
  final String wireName = r'CustomerOrderTimelinePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerOrderTimelinePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(CustomerOrderTimelineItem)]),
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
    CustomerOrderTimelinePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerOrderTimelinePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerOrderTimelineItem)]),
          ) as BuiltList<CustomerOrderTimelineItem>;
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
  CustomerOrderTimelinePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerOrderTimelinePageBuilder();
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

