//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_lookup_option.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_lookup_page.g.dart';

/// CustomerLookupPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class CustomerLookupPage implements Built<CustomerLookupPage, CustomerLookupPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<CustomerLookupOption> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  CustomerLookupPage._();

  factory CustomerLookupPage([void updates(CustomerLookupPageBuilder b)]) = _$CustomerLookupPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerLookupPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerLookupPage> get serializer => _$CustomerLookupPageSerializer();
}

class _$CustomerLookupPageSerializer implements PrimitiveSerializer<CustomerLookupPage> {
  @override
  final Iterable<Type> types = const [CustomerLookupPage, _$CustomerLookupPage];

  @override
  final String wireName = r'CustomerLookupPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerLookupPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(CustomerLookupOption)]),
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
    CustomerLookupPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerLookupPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerLookupOption)]),
          ) as BuiltList<CustomerLookupOption>;
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
  CustomerLookupPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerLookupPageBuilder();
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

