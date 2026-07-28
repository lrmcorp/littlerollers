//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_verification_document_summary.g.dart';

/// UserVerificationDocumentSummary
///
/// Properties:
/// * [kind] 
/// * [status] 
/// * [uploadStatus] 
/// * [scanStatus] 
/// * [rejectionReasonCode] 
/// * [uploadedAt] 
/// * [reviewedAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class UserVerificationDocumentSummary implements Built<UserVerificationDocumentSummary, UserVerificationDocumentSummaryBuilder> {
  @BuiltValueField(wireName: r'kind')
  UserVerificationDocumentSummaryKindEnum get kind;
  // enum kindEnum {  SELFIE,  KTP_FRONT,  };

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'uploadStatus')
  String get uploadStatus;

  @BuiltValueField(wireName: r'scanStatus')
  String get scanStatus;

  @BuiltValueField(wireName: r'rejectionReasonCode')
  String? get rejectionReasonCode;

  @BuiltValueField(wireName: r'uploadedAt')
  DateTime? get uploadedAt;

  @BuiltValueField(wireName: r'reviewedAt')
  DateTime? get reviewedAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  UserVerificationDocumentSummary._();

  factory UserVerificationDocumentSummary([void updates(UserVerificationDocumentSummaryBuilder b)]) = _$UserVerificationDocumentSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserVerificationDocumentSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserVerificationDocumentSummary> get serializer => _$UserVerificationDocumentSummarySerializer();
}

class _$UserVerificationDocumentSummarySerializer implements PrimitiveSerializer<UserVerificationDocumentSummary> {
  @override
  final Iterable<Type> types = const [UserVerificationDocumentSummary, _$UserVerificationDocumentSummary];

  @override
  final String wireName = r'UserVerificationDocumentSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserVerificationDocumentSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(UserVerificationDocumentSummaryKindEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'uploadStatus';
    yield serializers.serialize(
      object.uploadStatus,
      specifiedType: const FullType(String),
    );
    yield r'scanStatus';
    yield serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType(String),
    );
    yield r'rejectionReasonCode';
    yield object.rejectionReasonCode == null ? null : serializers.serialize(
      object.rejectionReasonCode,
      specifiedType: const FullType.nullable(String),
    );
    yield r'uploadedAt';
    yield object.uploadedAt == null ? null : serializers.serialize(
      object.uploadedAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'reviewedAt';
    yield object.reviewedAt == null ? null : serializers.serialize(
      object.reviewedAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserVerificationDocumentSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserVerificationDocumentSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserVerificationDocumentSummaryKindEnum),
          ) as UserVerificationDocumentSummaryKindEnum;
          result.kind = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'uploadStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.uploadStatus = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.scanStatus = valueDes;
          break;
        case r'rejectionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.rejectionReasonCode = valueDes;
          break;
        case r'uploadedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.uploadedAt = valueDes;
          break;
        case r'reviewedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.reviewedAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserVerificationDocumentSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserVerificationDocumentSummaryBuilder();
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

class UserVerificationDocumentSummaryKindEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SELFIE')
  static const UserVerificationDocumentSummaryKindEnum SELFIE = _$userVerificationDocumentSummaryKindEnum_SELFIE;
  @BuiltValueEnumConst(wireName: r'KTP_FRONT')
  static const UserVerificationDocumentSummaryKindEnum KTP_FRONT = _$userVerificationDocumentSummaryKindEnum_KTP_FRONT;

  static Serializer<UserVerificationDocumentSummaryKindEnum> get serializer => _$userVerificationDocumentSummaryKindEnumSerializer;

  const UserVerificationDocumentSummaryKindEnum._(String name): super(name);

  static BuiltSet<UserVerificationDocumentSummaryKindEnum> get values => _$userVerificationDocumentSummaryKindEnumValues;
  static UserVerificationDocumentSummaryKindEnum valueOf(String name) => _$userVerificationDocumentSummaryKindEnumValueOf(name);
}

