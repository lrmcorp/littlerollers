//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'submit_purchase_request.g.dart';

/// SubmitPurchaseRequest
///
/// Properties:
/// * [packageId] 
/// * [customerUserId] 
/// * [paymentProofUploadId] 
@BuiltValue()
abstract class SubmitPurchaseRequest implements Built<SubmitPurchaseRequest, SubmitPurchaseRequestBuilder> {
  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'customerUserId')
  String? get customerUserId;

  @BuiltValueField(wireName: r'paymentProofUploadId')
  String get paymentProofUploadId;

  SubmitPurchaseRequest._();

  factory SubmitPurchaseRequest([void updates(SubmitPurchaseRequestBuilder b)]) = _$SubmitPurchaseRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SubmitPurchaseRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SubmitPurchaseRequest> get serializer => _$SubmitPurchaseRequestSerializer();
}

class _$SubmitPurchaseRequestSerializer implements PrimitiveSerializer<SubmitPurchaseRequest> {
  @override
  final Iterable<Type> types = const [SubmitPurchaseRequest, _$SubmitPurchaseRequest];

  @override
  final String wireName = r'SubmitPurchaseRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SubmitPurchaseRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    if (object.customerUserId != null) {
      yield r'customerUserId';
      yield serializers.serialize(
        object.customerUserId,
        specifiedType: const FullType(String),
      );
    }
    yield r'paymentProofUploadId';
    yield serializers.serialize(
      object.paymentProofUploadId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SubmitPurchaseRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SubmitPurchaseRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'customerUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerUserId = valueDes;
          break;
        case r'paymentProofUploadId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.paymentProofUploadId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SubmitPurchaseRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SubmitPurchaseRequestBuilder();
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

