//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_payment_proof_status.g.dart';

/// OrderPaymentProofStatus
///
/// Properties:
/// * [uploadStatus] 
/// * [scanStatus] 
@BuiltValue()
abstract class OrderPaymentProofStatus implements Built<OrderPaymentProofStatus, OrderPaymentProofStatusBuilder> {
  @BuiltValueField(wireName: r'uploadStatus')
  OrderPaymentProofStatusUploadStatusEnum? get uploadStatus;
  // enum uploadStatusEnum {  ISSUED,  UPLOADED,  FINALIZED,  FAILED,  };

  @BuiltValueField(wireName: r'scanStatus')
  OrderPaymentProofStatusScanStatusEnum? get scanStatus;
  // enum scanStatusEnum {  PENDING,  CLEAN,  REJECTED,  INFECTED,  ERROR,  };

  OrderPaymentProofStatus._();

  factory OrderPaymentProofStatus([void updates(OrderPaymentProofStatusBuilder b)]) = _$OrderPaymentProofStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderPaymentProofStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderPaymentProofStatus> get serializer => _$OrderPaymentProofStatusSerializer();
}

class _$OrderPaymentProofStatusSerializer implements PrimitiveSerializer<OrderPaymentProofStatus> {
  @override
  final Iterable<Type> types = const [OrderPaymentProofStatus, _$OrderPaymentProofStatus];

  @override
  final String wireName = r'OrderPaymentProofStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderPaymentProofStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.uploadStatus != null) {
      yield r'uploadStatus';
      yield serializers.serialize(
        object.uploadStatus,
        specifiedType: const FullType(OrderPaymentProofStatusUploadStatusEnum),
      );
    }
    if (object.scanStatus != null) {
      yield r'scanStatus';
      yield serializers.serialize(
        object.scanStatus,
        specifiedType: const FullType(OrderPaymentProofStatusScanStatusEnum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderPaymentProofStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderPaymentProofStatusBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'uploadStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderPaymentProofStatusUploadStatusEnum),
          ) as OrderPaymentProofStatusUploadStatusEnum;
          result.uploadStatus = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderPaymentProofStatusScanStatusEnum),
          ) as OrderPaymentProofStatusScanStatusEnum;
          result.scanStatus = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderPaymentProofStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderPaymentProofStatusBuilder();
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

class OrderPaymentProofStatusUploadStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ISSUED')
  static const OrderPaymentProofStatusUploadStatusEnum ISSUED = _$orderPaymentProofStatusUploadStatusEnum_ISSUED;
  @BuiltValueEnumConst(wireName: r'UPLOADED')
  static const OrderPaymentProofStatusUploadStatusEnum UPLOADED = _$orderPaymentProofStatusUploadStatusEnum_UPLOADED;
  @BuiltValueEnumConst(wireName: r'FINALIZED')
  static const OrderPaymentProofStatusUploadStatusEnum FINALIZED = _$orderPaymentProofStatusUploadStatusEnum_FINALIZED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const OrderPaymentProofStatusUploadStatusEnum FAILED = _$orderPaymentProofStatusUploadStatusEnum_FAILED;

  static Serializer<OrderPaymentProofStatusUploadStatusEnum> get serializer => _$orderPaymentProofStatusUploadStatusEnumSerializer;

  const OrderPaymentProofStatusUploadStatusEnum._(String name): super(name);

  static BuiltSet<OrderPaymentProofStatusUploadStatusEnum> get values => _$orderPaymentProofStatusUploadStatusEnumValues;
  static OrderPaymentProofStatusUploadStatusEnum valueOf(String name) => _$orderPaymentProofStatusUploadStatusEnumValueOf(name);
}

class OrderPaymentProofStatusScanStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const OrderPaymentProofStatusScanStatusEnum PENDING = _$orderPaymentProofStatusScanStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'CLEAN')
  static const OrderPaymentProofStatusScanStatusEnum CLEAN = _$orderPaymentProofStatusScanStatusEnum_CLEAN;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const OrderPaymentProofStatusScanStatusEnum REJECTED = _$orderPaymentProofStatusScanStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'INFECTED')
  static const OrderPaymentProofStatusScanStatusEnum INFECTED = _$orderPaymentProofStatusScanStatusEnum_INFECTED;
  @BuiltValueEnumConst(wireName: r'ERROR')
  static const OrderPaymentProofStatusScanStatusEnum ERROR = _$orderPaymentProofStatusScanStatusEnum_ERROR;

  static Serializer<OrderPaymentProofStatusScanStatusEnum> get serializer => _$orderPaymentProofStatusScanStatusEnumSerializer;

  const OrderPaymentProofStatusScanStatusEnum._(String name): super(name);

  static BuiltSet<OrderPaymentProofStatusScanStatusEnum> get values => _$orderPaymentProofStatusScanStatusEnumValues;
  static OrderPaymentProofStatusScanStatusEnum valueOf(String name) => _$orderPaymentProofStatusScanStatusEnumValueOf(name);
}

