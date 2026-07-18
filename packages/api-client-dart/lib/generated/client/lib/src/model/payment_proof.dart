//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_proof.g.dart';

/// PaymentProof
///
/// Properties:
/// * [id] 
/// * [uploadStatus] 
/// * [scanStatus] 
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [sha256] 
/// * [replacedById] 
@BuiltValue()
abstract class PaymentProof implements Built<PaymentProof, PaymentProofBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'uploadStatus')
  PaymentProofUploadStatusEnum get uploadStatus;
  // enum uploadStatusEnum {  ISSUED,  UPLOADED,  FINALIZED,  FAILED,  };

  @BuiltValueField(wireName: r'scanStatus')
  PaymentProofScanStatusEnum get scanStatus;
  // enum scanStatusEnum {  PENDING,  CLEAN,  REJECTED,  INFECTED,  ERROR,  };

  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  String get mimeType;

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  @BuiltValueField(wireName: r'replacedById')
  String? get replacedById;

  PaymentProof._();

  factory PaymentProof([void updates(PaymentProofBuilder b)]) = _$PaymentProof;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentProofBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentProof> get serializer => _$PaymentProofSerializer();
}

class _$PaymentProofSerializer implements PrimitiveSerializer<PaymentProof> {
  @override
  final Iterable<Type> types = const [PaymentProof, _$PaymentProof];

  @override
  final String wireName = r'PaymentProof';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentProof object, {
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
      specifiedType: const FullType(PaymentProofUploadStatusEnum),
    );
    yield r'scanStatus';
    yield serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType(PaymentProofScanStatusEnum),
    );
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
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
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
    if (object.replacedById != null) {
      yield r'replacedById';
      yield serializers.serialize(
        object.replacedById,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentProof object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentProofBuilder result,
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
            specifiedType: const FullType(PaymentProofUploadStatusEnum),
          ) as PaymentProofUploadStatusEnum;
          result.uploadStatus = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentProofScanStatusEnum),
          ) as PaymentProofScanStatusEnum;
          result.scanStatus = valueDes;
          break;
        case r'fileName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fileName = valueDes;
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
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        case r'replacedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.replacedById = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentProof deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentProofBuilder();
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

class PaymentProofUploadStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ISSUED')
  static const PaymentProofUploadStatusEnum ISSUED = _$paymentProofUploadStatusEnum_ISSUED;
  @BuiltValueEnumConst(wireName: r'UPLOADED')
  static const PaymentProofUploadStatusEnum UPLOADED = _$paymentProofUploadStatusEnum_UPLOADED;
  @BuiltValueEnumConst(wireName: r'FINALIZED')
  static const PaymentProofUploadStatusEnum FINALIZED = _$paymentProofUploadStatusEnum_FINALIZED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const PaymentProofUploadStatusEnum FAILED = _$paymentProofUploadStatusEnum_FAILED;

  static Serializer<PaymentProofUploadStatusEnum> get serializer => _$paymentProofUploadStatusEnumSerializer;

  const PaymentProofUploadStatusEnum._(String name): super(name);

  static BuiltSet<PaymentProofUploadStatusEnum> get values => _$paymentProofUploadStatusEnumValues;
  static PaymentProofUploadStatusEnum valueOf(String name) => _$paymentProofUploadStatusEnumValueOf(name);
}

class PaymentProofScanStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const PaymentProofScanStatusEnum PENDING = _$paymentProofScanStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'CLEAN')
  static const PaymentProofScanStatusEnum CLEAN = _$paymentProofScanStatusEnum_CLEAN;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const PaymentProofScanStatusEnum REJECTED = _$paymentProofScanStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'INFECTED')
  static const PaymentProofScanStatusEnum INFECTED = _$paymentProofScanStatusEnum_INFECTED;
  @BuiltValueEnumConst(wireName: r'ERROR')
  static const PaymentProofScanStatusEnum ERROR = _$paymentProofScanStatusEnum_ERROR;

  static Serializer<PaymentProofScanStatusEnum> get serializer => _$paymentProofScanStatusEnumSerializer;

  const PaymentProofScanStatusEnum._(String name): super(name);

  static BuiltSet<PaymentProofScanStatusEnum> get values => _$paymentProofScanStatusEnumValues;
  static PaymentProofScanStatusEnum valueOf(String name) => _$paymentProofScanStatusEnumValueOf(name);
}

