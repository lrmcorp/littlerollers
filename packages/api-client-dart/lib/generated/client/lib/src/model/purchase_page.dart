//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/purchase.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'purchase_page.g.dart';

/// PurchasePage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class PurchasePage implements Built<PurchasePage, PurchasePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Purchase> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PurchasePage._();

  factory PurchasePage([void updates(PurchasePageBuilder b)]) = _$PurchasePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PurchasePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PurchasePage> get serializer => _$PurchasePageSerializer();
}

class _$PurchasePageSerializer implements PrimitiveSerializer<PurchasePage> {
  @override
  final Iterable<Type> types = const [PurchasePage, _$PurchasePage];

  @override
  final String wireName = r'PurchasePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PurchasePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Purchase)]),
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
    PurchasePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PurchasePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Purchase)]),
          ) as BuiltList<Purchase>;
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
  PurchasePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PurchasePageBuilder();
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

