//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/payment_review_summary.dart';
import 'package:openapi/src/model/payment_review_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_page.g.dart';

/// PaymentReviewPage
///
/// Properties:
/// * [items] 
/// * [summary] 
/// * [generatedAt] 
/// * [page] 
@BuiltValue()
abstract class PaymentReviewPage implements Built<PaymentReviewPage, PaymentReviewPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PaymentReviewItem> get items;

  @BuiltValueField(wireName: r'summary')
  PaymentReviewSummary get summary;

  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PaymentReviewPage._();

  factory PaymentReviewPage([void updates(PaymentReviewPageBuilder b)]) = _$PaymentReviewPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewPage> get serializer => _$PaymentReviewPageSerializer();
}

class _$PaymentReviewPageSerializer implements PrimitiveSerializer<PaymentReviewPage> {
  @override
  final Iterable<Type> types = const [PaymentReviewPage, _$PaymentReviewPage];

  @override
  final String wireName = r'PaymentReviewPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PaymentReviewItem)]),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(PaymentReviewSummary),
    );
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
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
    PaymentReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PaymentReviewItem)]),
          ) as BuiltList<PaymentReviewItem>;
          result.items.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewSummary),
          ) as PaymentReviewSummary;
          result.summary.replace(valueDes);
          break;
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
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
  PaymentReviewPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewPageBuilder();
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

