//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package_promotion.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion_page.g.dart';

/// PackagePromotionPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class PackagePromotionPage implements Built<PackagePromotionPage, PackagePromotionPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PackagePromotion> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PackagePromotionPage._();

  factory PackagePromotionPage([void updates(PackagePromotionPageBuilder b)]) = _$PackagePromotionPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePromotionPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotionPage> get serializer => _$PackagePromotionPageSerializer();
}

class _$PackagePromotionPageSerializer implements PrimitiveSerializer<PackagePromotionPage> {
  @override
  final Iterable<Type> types = const [PackagePromotionPage, _$PackagePromotionPage];

  @override
  final String wireName = r'PackagePromotionPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
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
    PackagePromotionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
          ) as BuiltList<PackagePromotion>;
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
  PackagePromotionPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePromotionPageBuilder();
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

