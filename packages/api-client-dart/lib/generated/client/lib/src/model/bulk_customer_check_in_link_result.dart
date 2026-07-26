//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/bulk_customer_check_in_link_item.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'bulk_customer_check_in_link_result.g.dart';

/// BulkCustomerCheckInLinkResult
///
/// Properties:
/// * [classSlotId] 
/// * [items] 
@BuiltValue()
abstract class BulkCustomerCheckInLinkResult implements Built<BulkCustomerCheckInLinkResult, BulkCustomerCheckInLinkResultBuilder> {
  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'items')
  BuiltList<BulkCustomerCheckInLinkItem> get items;

  BulkCustomerCheckInLinkResult._();

  factory BulkCustomerCheckInLinkResult([void updates(BulkCustomerCheckInLinkResultBuilder b)]) = _$BulkCustomerCheckInLinkResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BulkCustomerCheckInLinkResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BulkCustomerCheckInLinkResult> get serializer => _$BulkCustomerCheckInLinkResultSerializer();
}

class _$BulkCustomerCheckInLinkResultSerializer implements PrimitiveSerializer<BulkCustomerCheckInLinkResult> {
  @override
  final Iterable<Type> types = const [BulkCustomerCheckInLinkResult, _$BulkCustomerCheckInLinkResult];

  @override
  final String wireName = r'BulkCustomerCheckInLinkResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BulkCustomerCheckInLinkResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(BulkCustomerCheckInLinkItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BulkCustomerCheckInLinkResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BulkCustomerCheckInLinkResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(BulkCustomerCheckInLinkItem)]),
          ) as BuiltList<BulkCustomerCheckInLinkItem>;
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
  BulkCustomerCheckInLinkResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BulkCustomerCheckInLinkResultBuilder();
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

