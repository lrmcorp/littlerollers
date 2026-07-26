//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/order.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_page.g.dart';

/// OrderPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class OrderPage implements Built<OrderPage, OrderPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Order> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  OrderPage._();

  factory OrderPage([void updates(OrderPageBuilder b)]) = _$OrderPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderPage> get serializer => _$OrderPageSerializer();
}

class _$OrderPageSerializer implements PrimitiveSerializer<OrderPage> {
  @override
  final Iterable<Type> types = const [OrderPage, _$OrderPage];

  @override
  final String wireName = r'OrderPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Order)]),
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
    OrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Order)]),
          ) as BuiltList<Order>;
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
  OrderPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderPageBuilder();
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

