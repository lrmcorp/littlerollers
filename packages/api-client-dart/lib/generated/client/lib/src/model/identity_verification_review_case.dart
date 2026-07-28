//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/identity_verification_review_user.dart';
import 'package:openapi/src/model/identity_verification_document.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_review_case.g.dart';

/// IdentityVerificationReviewCase
///
/// Properties:
/// * [id] 
/// * [user] 
/// * [verificationStatus] 
/// * [oldestAt] 
/// * [documents] 
@BuiltValue()
abstract class IdentityVerificationReviewCase implements Built<IdentityVerificationReviewCase, IdentityVerificationReviewCaseBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'user')
  IdentityVerificationReviewUser get user;

  @BuiltValueField(wireName: r'verificationStatus')
  IdentityVerificationReviewCaseVerificationStatusEnum get verificationStatus;
  // enum verificationStatusEnum {  PENDING,  ACTION_REQUIRED,  APPROVED,  };

  @BuiltValueField(wireName: r'oldestAt')
  DateTime? get oldestAt;

  @BuiltValueField(wireName: r'documents')
  BuiltList<IdentityVerificationDocument> get documents;

  IdentityVerificationReviewCase._();

  factory IdentityVerificationReviewCase([void updates(IdentityVerificationReviewCaseBuilder b)]) = _$IdentityVerificationReviewCase;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationReviewCaseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationReviewCase> get serializer => _$IdentityVerificationReviewCaseSerializer();
}

class _$IdentityVerificationReviewCaseSerializer implements PrimitiveSerializer<IdentityVerificationReviewCase> {
  @override
  final Iterable<Type> types = const [IdentityVerificationReviewCase, _$IdentityVerificationReviewCase];

  @override
  final String wireName = r'IdentityVerificationReviewCase';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationReviewCase object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'user';
    yield serializers.serialize(
      object.user,
      specifiedType: const FullType(IdentityVerificationReviewUser),
    );
    yield r'verificationStatus';
    yield serializers.serialize(
      object.verificationStatus,
      specifiedType: const FullType(IdentityVerificationReviewCaseVerificationStatusEnum),
    );
    yield r'oldestAt';
    yield object.oldestAt == null ? null : serializers.serialize(
      object.oldestAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'documents';
    yield serializers.serialize(
      object.documents,
      specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewCase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationReviewCaseBuilder result,
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
        case r'user':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationReviewUser),
          ) as IdentityVerificationReviewUser;
          result.user.replace(valueDes);
          break;
        case r'verificationStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationReviewCaseVerificationStatusEnum),
          ) as IdentityVerificationReviewCaseVerificationStatusEnum;
          result.verificationStatus = valueDes;
          break;
        case r'oldestAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.oldestAt = valueDes;
          break;
        case r'documents':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
          ) as BuiltList<IdentityVerificationDocument>;
          result.documents.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationReviewCase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationReviewCaseBuilder();
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

class IdentityVerificationReviewCaseVerificationStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const IdentityVerificationReviewCaseVerificationStatusEnum PENDING = _$identityVerificationReviewCaseVerificationStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const IdentityVerificationReviewCaseVerificationStatusEnum ACTION_REQUIRED = _$identityVerificationReviewCaseVerificationStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const IdentityVerificationReviewCaseVerificationStatusEnum APPROVED = _$identityVerificationReviewCaseVerificationStatusEnum_APPROVED;

  static Serializer<IdentityVerificationReviewCaseVerificationStatusEnum> get serializer => _$identityVerificationReviewCaseVerificationStatusEnumSerializer;

  const IdentityVerificationReviewCaseVerificationStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationReviewCaseVerificationStatusEnum> get values => _$identityVerificationReviewCaseVerificationStatusEnumValues;
  static IdentityVerificationReviewCaseVerificationStatusEnum valueOf(String name) => _$identityVerificationReviewCaseVerificationStatusEnumValueOf(name);
}

