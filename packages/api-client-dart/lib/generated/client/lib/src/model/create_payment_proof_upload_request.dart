//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_payment_proof_upload_request.g.dart';

/// CreatePaymentProofUploadRequest
///
/// Properties:
/// * [branchId] 
/// * [packageId] 
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [sha256] 
@BuiltValue()
abstract class CreatePaymentProofUploadRequest implements Built<CreatePaymentProofUploadRequest, CreatePaymentProofUploadRequestBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'packageId')
  String? get packageId;

  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  String get mimeType;

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  CreatePaymentProofUploadRequest._();

  factory CreatePaymentProofUploadRequest([void updates(CreatePaymentProofUploadRequestBuilder b)]) = _$CreatePaymentProofUploadRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreatePaymentProofUploadRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreatePaymentProofUploadRequest> get serializer => _$CreatePaymentProofUploadRequestSerializer();
}

class _$CreatePaymentProofUploadRequestSerializer implements PrimitiveSerializer<CreatePaymentProofUploadRequest> {
  @override
  final Iterable<Type> types = const [CreatePaymentProofUploadRequest, _$CreatePaymentProofUploadRequest];

  @override
  final String wireName = r'CreatePaymentProofUploadRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreatePaymentProofUploadRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    if (object.packageId != null) {
      yield r'packageId';
      yield serializers.serialize(
        object.packageId,
        specifiedType: const FullType(String),
      );
    }
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
  }

  @override
  Object serialize(
    Serializers serializers,
    CreatePaymentProofUploadRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreatePaymentProofUploadRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreatePaymentProofUploadRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreatePaymentProofUploadRequestBuilder();
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

