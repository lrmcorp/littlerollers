//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/payment_usage_history_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_usage_history_page.g.dart';

/// PaymentUsageHistoryPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class PaymentUsageHistoryPage implements Built<PaymentUsageHistoryPage, PaymentUsageHistoryPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PaymentUsageHistoryItem> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PaymentUsageHistoryPage._();

  factory PaymentUsageHistoryPage([void updates(PaymentUsageHistoryPageBuilder b)]) = _$PaymentUsageHistoryPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentUsageHistoryPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentUsageHistoryPage> get serializer => _$PaymentUsageHistoryPageSerializer();
}

class _$PaymentUsageHistoryPageSerializer implements PrimitiveSerializer<PaymentUsageHistoryPage> {
  @override
  final Iterable<Type> types = const [PaymentUsageHistoryPage, _$PaymentUsageHistoryPage];

  @override
  final String wireName = r'PaymentUsageHistoryPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentUsageHistoryPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PaymentUsageHistoryItem)]),
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
    PaymentUsageHistoryPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentUsageHistoryPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PaymentUsageHistoryItem)]),
          ) as BuiltList<PaymentUsageHistoryItem>;
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
  PaymentUsageHistoryPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentUsageHistoryPageBuilder();
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

