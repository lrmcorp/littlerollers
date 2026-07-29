//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/json_object.dart';
import 'package:openapi/src/model/voucher_redemption.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_redemption_page.g.dart';

/// VoucherRedemptionPage
///
/// Properties:
/// * [voucher] 
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class VoucherRedemptionPage implements Built<VoucherRedemptionPage, VoucherRedemptionPageBuilder> {
  @BuiltValueField(wireName: r'voucher')
  JsonObject get voucher;

  @BuiltValueField(wireName: r'items')
  BuiltList<VoucherRedemption> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  VoucherRedemptionPage._();

  factory VoucherRedemptionPage([void updates(VoucherRedemptionPageBuilder b)]) = _$VoucherRedemptionPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherRedemptionPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherRedemptionPage> get serializer => _$VoucherRedemptionPageSerializer();
}

class _$VoucherRedemptionPageSerializer implements PrimitiveSerializer<VoucherRedemptionPage> {
  @override
  final Iterable<Type> types = const [VoucherRedemptionPage, _$VoucherRedemptionPage];

  @override
  final String wireName = r'VoucherRedemptionPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherRedemptionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'voucher';
    yield serializers.serialize(
      object.voucher,
      specifiedType: const FullType(JsonObject),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(VoucherRedemption)]),
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
    VoucherRedemptionPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherRedemptionPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'voucher':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.voucher = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(VoucherRedemption)]),
          ) as BuiltList<VoucherRedemption>;
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
  VoucherRedemptionPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherRedemptionPageBuilder();
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

