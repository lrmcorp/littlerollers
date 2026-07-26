//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'bulk_customer_check_in_link_command.g.dart';

/// BulkCustomerCheckInLinkCommand
///
/// Properties:
/// * [bookingIds] 
@BuiltValue()
abstract class BulkCustomerCheckInLinkCommand implements Built<BulkCustomerCheckInLinkCommand, BulkCustomerCheckInLinkCommandBuilder> {
  @BuiltValueField(wireName: r'bookingIds')
  BuiltSet<String>? get bookingIds;

  BulkCustomerCheckInLinkCommand._();

  factory BulkCustomerCheckInLinkCommand([void updates(BulkCustomerCheckInLinkCommandBuilder b)]) = _$BulkCustomerCheckInLinkCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BulkCustomerCheckInLinkCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BulkCustomerCheckInLinkCommand> get serializer => _$BulkCustomerCheckInLinkCommandSerializer();
}

class _$BulkCustomerCheckInLinkCommandSerializer implements PrimitiveSerializer<BulkCustomerCheckInLinkCommand> {
  @override
  final Iterable<Type> types = const [BulkCustomerCheckInLinkCommand, _$BulkCustomerCheckInLinkCommand];

  @override
  final String wireName = r'BulkCustomerCheckInLinkCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BulkCustomerCheckInLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.bookingIds != null) {
      yield r'bookingIds';
      yield serializers.serialize(
        object.bookingIds,
        specifiedType: const FullType(BuiltSet, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BulkCustomerCheckInLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BulkCustomerCheckInLinkCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bookingIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.bookingIds.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BulkCustomerCheckInLinkCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BulkCustomerCheckInLinkCommandBuilder();
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

