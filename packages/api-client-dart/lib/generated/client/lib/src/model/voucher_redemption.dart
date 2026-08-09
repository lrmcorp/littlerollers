//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary_instructor.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_redemption.g.dart';

/// VoucherRedemption
///
/// Properties:
/// * [id] 
/// * [customer] 
/// * [purchase] 
/// * [discountRp] 
/// * [redeemedAt] 
/// * [releasedAt] 
@BuiltValue()
abstract class VoucherRedemption implements Built<VoucherRedemption, VoucherRedemptionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'customer')
  PublicScheduleSummaryInstructor get customer;

  @BuiltValueField(wireName: r'purchase')
  JsonObject get purchase;

  @BuiltValueField(wireName: r'discountRp')
  int get discountRp;

  @BuiltValueField(wireName: r'redeemedAt')
  DateTime get redeemedAt;

  @BuiltValueField(wireName: r'releasedAt')
  DateTime? get releasedAt;

  VoucherRedemption._();

  factory VoucherRedemption([void updates(VoucherRedemptionBuilder b)]) = _$VoucherRedemption;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherRedemptionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherRedemption> get serializer => _$VoucherRedemptionSerializer();
}

class _$VoucherRedemptionSerializer implements PrimitiveSerializer<VoucherRedemption> {
  @override
  final Iterable<Type> types = const [VoucherRedemption, _$VoucherRedemption];

  @override
  final String wireName = r'VoucherRedemption';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherRedemption object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'customer';
    yield serializers.serialize(
      object.customer,
      specifiedType: const FullType(PublicScheduleSummaryInstructor),
    );
    yield r'purchase';
    yield serializers.serialize(
      object.purchase,
      specifiedType: const FullType(JsonObject),
    );
    yield r'discountRp';
    yield serializers.serialize(
      object.discountRp,
      specifiedType: const FullType(int),
    );
    yield r'redeemedAt';
    yield serializers.serialize(
      object.redeemedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.releasedAt != null) {
      yield r'releasedAt';
      yield serializers.serialize(
        object.releasedAt,
        specifiedType: const FullType(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherRedemption object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherRedemptionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicScheduleSummaryInstructor),
          ) as PublicScheduleSummaryInstructor;
          result.customer.replace(valueDes);
          break;
        case r'purchase':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.purchase = valueDes;
          break;
        case r'discountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountRp = valueDes;
          break;
        case r'redeemedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.redeemedAt = valueDes;
          break;
        case r'releasedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.releasedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VoucherRedemption deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherRedemptionBuilder();
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

