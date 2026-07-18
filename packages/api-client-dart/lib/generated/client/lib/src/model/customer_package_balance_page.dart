//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_package_balance.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_package_balance_page.g.dart';

/// CustomerPackageBalancePage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class CustomerPackageBalancePage implements Built<CustomerPackageBalancePage, CustomerPackageBalancePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<CustomerPackageBalance> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  CustomerPackageBalancePage._();

  factory CustomerPackageBalancePage([void updates(CustomerPackageBalancePageBuilder b)]) = _$CustomerPackageBalancePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerPackageBalancePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerPackageBalancePage> get serializer => _$CustomerPackageBalancePageSerializer();
}

class _$CustomerPackageBalancePageSerializer implements PrimitiveSerializer<CustomerPackageBalancePage> {
  @override
  final Iterable<Type> types = const [CustomerPackageBalancePage, _$CustomerPackageBalancePage];

  @override
  final String wireName = r'CustomerPackageBalancePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerPackageBalancePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(CustomerPackageBalance)]),
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
    CustomerPackageBalancePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerPackageBalancePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerPackageBalance)]),
          ) as BuiltList<CustomerPackageBalance>;
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
  CustomerPackageBalancePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerPackageBalancePageBuilder();
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

