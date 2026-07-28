//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'approve_purchase_request.g.dart';

/// ApprovePurchaseRequest
///
/// Properties:
/// * [reasonCode] 
/// * [expectedVersion] 
/// * [note] 
@BuiltValue()
abstract class ApprovePurchaseRequest implements Built<ApprovePurchaseRequest, ApprovePurchaseRequestBuilder> {
  @BuiltValueField(wireName: r'reasonCode')
  ApprovePurchaseRequestReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  PAYMENT_VERIFIED,  PROOF_INVALID,  AMOUNT_MISMATCH,  DUPLICATE_PURCHASE,  OTHER_REVIEW_REQUIRED,  };

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'note')
  String? get note;

  ApprovePurchaseRequest._();

  factory ApprovePurchaseRequest([void updates(ApprovePurchaseRequestBuilder b)]) = _$ApprovePurchaseRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ApprovePurchaseRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ApprovePurchaseRequest> get serializer => _$ApprovePurchaseRequestSerializer();
}

class _$ApprovePurchaseRequestSerializer implements PrimitiveSerializer<ApprovePurchaseRequest> {
  @override
  final Iterable<Type> types = const [ApprovePurchaseRequest, _$ApprovePurchaseRequest];

  @override
  final String wireName = r'ApprovePurchaseRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ApprovePurchaseRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(ApprovePurchaseRequestReasonCodeEnum),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ApprovePurchaseRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ApprovePurchaseRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ApprovePurchaseRequestReasonCodeEnum),
          ) as ApprovePurchaseRequestReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ApprovePurchaseRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ApprovePurchaseRequestBuilder();
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

class ApprovePurchaseRequestReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PAYMENT_VERIFIED')
  static const ApprovePurchaseRequestReasonCodeEnum PAYMENT_VERIFIED = _$approvePurchaseRequestReasonCodeEnum_PAYMENT_VERIFIED;
  @BuiltValueEnumConst(wireName: r'PROOF_INVALID')
  static const ApprovePurchaseRequestReasonCodeEnum PROOF_INVALID = _$approvePurchaseRequestReasonCodeEnum_PROOF_INVALID;
  @BuiltValueEnumConst(wireName: r'AMOUNT_MISMATCH')
  static const ApprovePurchaseRequestReasonCodeEnum AMOUNT_MISMATCH = _$approvePurchaseRequestReasonCodeEnum_AMOUNT_MISMATCH;
  @BuiltValueEnumConst(wireName: r'DUPLICATE_PURCHASE')
  static const ApprovePurchaseRequestReasonCodeEnum DUPLICATE_PURCHASE = _$approvePurchaseRequestReasonCodeEnum_DUPLICATE_PURCHASE;
  @BuiltValueEnumConst(wireName: r'OTHER_REVIEW_REQUIRED')
  static const ApprovePurchaseRequestReasonCodeEnum OTHER_REVIEW_REQUIRED = _$approvePurchaseRequestReasonCodeEnum_OTHER_REVIEW_REQUIRED;

  static Serializer<ApprovePurchaseRequestReasonCodeEnum> get serializer => _$approvePurchaseRequestReasonCodeEnumSerializer;

  const ApprovePurchaseRequestReasonCodeEnum._(String name): super(name);

  static BuiltSet<ApprovePurchaseRequestReasonCodeEnum> get values => _$approvePurchaseRequestReasonCodeEnumValues;
  static ApprovePurchaseRequestReasonCodeEnum valueOf(String name) => _$approvePurchaseRequestReasonCodeEnumValueOf(name);
}

