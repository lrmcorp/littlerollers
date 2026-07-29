//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package_promotion_order_page_items_inner.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion_order_page.g.dart';

/// PackagePromotionOrderPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class PackagePromotionOrderPage implements Built<PackagePromotionOrderPage, PackagePromotionOrderPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PackagePromotionOrderPageItemsInner> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PackagePromotionOrderPage._();

  factory PackagePromotionOrderPage([void updates(PackagePromotionOrderPageBuilder b)]) = _$PackagePromotionOrderPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePromotionOrderPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotionOrderPage> get serializer => _$PackagePromotionOrderPageSerializer();
}

class _$PackagePromotionOrderPageSerializer implements PrimitiveSerializer<PackagePromotionOrderPage> {
  @override
  final Iterable<Type> types = const [PackagePromotionOrderPage, _$PackagePromotionOrderPage];

  @override
  final String wireName = r'PackagePromotionOrderPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotionOrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PackagePromotionOrderPageItemsInner)]),
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
    PackagePromotionOrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionOrderPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackagePromotionOrderPageItemsInner)]),
          ) as BuiltList<PackagePromotionOrderPageItemsInner>;
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
  PackagePromotionOrderPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePromotionOrderPageBuilder();
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

