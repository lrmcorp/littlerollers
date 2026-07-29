//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package_promotion.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'list_package_promotions200_response.g.dart';

/// ListPackagePromotions200Response
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class ListPackagePromotions200Response implements Built<ListPackagePromotions200Response, ListPackagePromotions200ResponseBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PackagePromotion> get items;

  ListPackagePromotions200Response._();

  factory ListPackagePromotions200Response([void updates(ListPackagePromotions200ResponseBuilder b)]) = _$ListPackagePromotions200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ListPackagePromotions200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ListPackagePromotions200Response> get serializer => _$ListPackagePromotions200ResponseSerializer();
}

class _$ListPackagePromotions200ResponseSerializer implements PrimitiveSerializer<ListPackagePromotions200Response> {
  @override
  final Iterable<Type> types = const [ListPackagePromotions200Response, _$ListPackagePromotions200Response];

  @override
  final String wireName = r'ListPackagePromotions200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ListPackagePromotions200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ListPackagePromotions200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ListPackagePromotions200ResponseBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ListPackagePromotions200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ListPackagePromotions200ResponseBuilder();
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

