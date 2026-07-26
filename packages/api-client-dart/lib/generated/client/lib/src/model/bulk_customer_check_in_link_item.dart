//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_check_in_issue.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'bulk_customer_check_in_link_item.g.dart';

/// BulkCustomerCheckInLinkItem
///
/// Properties:
/// * [bookingId] 
/// * [ok] 
/// * [result] 
/// * [errorCode] 
@BuiltValue()
abstract class BulkCustomerCheckInLinkItem implements Built<BulkCustomerCheckInLinkItem, BulkCustomerCheckInLinkItemBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'ok')
  bool get ok;

  @BuiltValueField(wireName: r'result')
  CustomerCheckInIssue? get result;

  @BuiltValueField(wireName: r'errorCode')
  String? get errorCode;

  BulkCustomerCheckInLinkItem._();

  factory BulkCustomerCheckInLinkItem([void updates(BulkCustomerCheckInLinkItemBuilder b)]) = _$BulkCustomerCheckInLinkItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BulkCustomerCheckInLinkItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BulkCustomerCheckInLinkItem> get serializer => _$BulkCustomerCheckInLinkItemSerializer();
}

class _$BulkCustomerCheckInLinkItemSerializer implements PrimitiveSerializer<BulkCustomerCheckInLinkItem> {
  @override
  final Iterable<Type> types = const [BulkCustomerCheckInLinkItem, _$BulkCustomerCheckInLinkItem];

  @override
  final String wireName = r'BulkCustomerCheckInLinkItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BulkCustomerCheckInLinkItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'ok';
    yield serializers.serialize(
      object.ok,
      specifiedType: const FullType(bool),
    );
    if (object.result != null) {
      yield r'result';
      yield serializers.serialize(
        object.result,
        specifiedType: const FullType(CustomerCheckInIssue),
      );
    }
    if (object.errorCode != null) {
      yield r'errorCode';
      yield serializers.serialize(
        object.errorCode,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BulkCustomerCheckInLinkItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BulkCustomerCheckInLinkItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'ok':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.ok = valueDes;
          break;
        case r'result':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerCheckInIssue),
          ) as CustomerCheckInIssue;
          result.result.replace(valueDes);
          break;
        case r'errorCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.errorCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BulkCustomerCheckInLinkItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BulkCustomerCheckInLinkItemBuilder();
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

