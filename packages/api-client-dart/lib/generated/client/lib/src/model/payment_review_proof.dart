//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_proof.g.dart';

/// PaymentReviewProof
///
/// Properties:
/// * [id] 
/// * [uploadStatus] 
/// * [scanStatus] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [finalizedAt] 
@BuiltValue()
abstract class PaymentReviewProof implements Built<PaymentReviewProof, PaymentReviewProofBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'uploadStatus')
  PaymentReviewProofUploadStatusEnum get uploadStatus;
  // enum uploadStatusEnum {  ISSUED,  UPLOADED,  FINALIZED,  FAILED,  };

  @BuiltValueField(wireName: r'scanStatus')
  PaymentReviewProofScanStatusEnum get scanStatus;
  // enum scanStatusEnum {  PENDING,  CLEAN,  REJECTED,  INFECTED,  ERROR,  };

  @BuiltValueField(wireName: r'mimeType')
  String get mimeType;

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'finalizedAt')
  DateTime? get finalizedAt;

  PaymentReviewProof._();

  factory PaymentReviewProof([void updates(PaymentReviewProofBuilder b)]) = _$PaymentReviewProof;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewProofBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewProof> get serializer => _$PaymentReviewProofSerializer();
}

class _$PaymentReviewProofSerializer implements PrimitiveSerializer<PaymentReviewProof> {
  @override
  final Iterable<Type> types = const [PaymentReviewProof, _$PaymentReviewProof];

  @override
  final String wireName = r'PaymentReviewProof';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewProof object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'uploadStatus';
    yield serializers.serialize(
      object.uploadStatus,
      specifiedType: const FullType(PaymentReviewProofUploadStatusEnum),
    );
    yield r'scanStatus';
    yield serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType(PaymentReviewProofScanStatusEnum),
    );
    yield r'mimeType';
    yield serializers.serialize(
      object.mimeType,
      specifiedType: const FullType(String),
    );
    yield r'sizeBytes';
    yield serializers.serialize(
      object.sizeBytes,
      specifiedType: const FullType(int),
    );
    if (object.finalizedAt != null) {
      yield r'finalizedAt';
      yield serializers.serialize(
        object.finalizedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewProof object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewProofBuilder result,
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
        case r'uploadStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewProofUploadStatusEnum),
          ) as PaymentReviewProofUploadStatusEnum;
          result.uploadStatus = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewProofScanStatusEnum),
          ) as PaymentReviewProofScanStatusEnum;
          result.scanStatus = valueDes;
          break;
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mimeType = valueDes;
          break;
        case r'sizeBytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sizeBytes = valueDes;
          break;
        case r'finalizedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.finalizedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewProof deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewProofBuilder();
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

class PaymentReviewProofUploadStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ISSUED')
  static const PaymentReviewProofUploadStatusEnum ISSUED = _$paymentReviewProofUploadStatusEnum_ISSUED;
  @BuiltValueEnumConst(wireName: r'UPLOADED')
  static const PaymentReviewProofUploadStatusEnum UPLOADED = _$paymentReviewProofUploadStatusEnum_UPLOADED;
  @BuiltValueEnumConst(wireName: r'FINALIZED')
  static const PaymentReviewProofUploadStatusEnum FINALIZED = _$paymentReviewProofUploadStatusEnum_FINALIZED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const PaymentReviewProofUploadStatusEnum FAILED = _$paymentReviewProofUploadStatusEnum_FAILED;

  static Serializer<PaymentReviewProofUploadStatusEnum> get serializer => _$paymentReviewProofUploadStatusEnumSerializer;

  const PaymentReviewProofUploadStatusEnum._(String name): super(name);

  static BuiltSet<PaymentReviewProofUploadStatusEnum> get values => _$paymentReviewProofUploadStatusEnumValues;
  static PaymentReviewProofUploadStatusEnum valueOf(String name) => _$paymentReviewProofUploadStatusEnumValueOf(name);
}

class PaymentReviewProofScanStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const PaymentReviewProofScanStatusEnum PENDING = _$paymentReviewProofScanStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'CLEAN')
  static const PaymentReviewProofScanStatusEnum CLEAN = _$paymentReviewProofScanStatusEnum_CLEAN;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const PaymentReviewProofScanStatusEnum REJECTED = _$paymentReviewProofScanStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'INFECTED')
  static const PaymentReviewProofScanStatusEnum INFECTED = _$paymentReviewProofScanStatusEnum_INFECTED;
  @BuiltValueEnumConst(wireName: r'ERROR')
  static const PaymentReviewProofScanStatusEnum ERROR = _$paymentReviewProofScanStatusEnum_ERROR;

  static Serializer<PaymentReviewProofScanStatusEnum> get serializer => _$paymentReviewProofScanStatusEnumSerializer;

  const PaymentReviewProofScanStatusEnum._(String name): super(name);

  static BuiltSet<PaymentReviewProofScanStatusEnum> get values => _$paymentReviewProofScanStatusEnumValues;
  static PaymentReviewProofScanStatusEnum valueOf(String name) => _$paymentReviewProofScanStatusEnumValueOf(name);
}

