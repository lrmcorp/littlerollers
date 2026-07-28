//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/user_verification_document_summary.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_verification_summary.g.dart';

/// UserVerificationSummary
///
/// Properties:
/// * [status] 
/// * [documents] 
@BuiltValue()
abstract class UserVerificationSummary implements Built<UserVerificationSummary, UserVerificationSummaryBuilder> {
  @BuiltValueField(wireName: r'status')
  UserVerificationSummaryStatusEnum get status;
  // enum statusEnum {  PENDING,  ACTION_REQUIRED,  APPROVED,  };

  @BuiltValueField(wireName: r'documents')
  BuiltList<UserVerificationDocumentSummary> get documents;

  UserVerificationSummary._();

  factory UserVerificationSummary([void updates(UserVerificationSummaryBuilder b)]) = _$UserVerificationSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserVerificationSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserVerificationSummary> get serializer => _$UserVerificationSummarySerializer();
}

class _$UserVerificationSummarySerializer implements PrimitiveSerializer<UserVerificationSummary> {
  @override
  final Iterable<Type> types = const [UserVerificationSummary, _$UserVerificationSummary];

  @override
  final String wireName = r'UserVerificationSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserVerificationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(UserVerificationSummaryStatusEnum),
    );
    yield r'documents';
    yield serializers.serialize(
      object.documents,
      specifiedType: const FullType(BuiltList, [FullType(UserVerificationDocumentSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserVerificationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserVerificationSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserVerificationSummaryStatusEnum),
          ) as UserVerificationSummaryStatusEnum;
          result.status = valueDes;
          break;
        case r'documents':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserVerificationDocumentSummary)]),
          ) as BuiltList<UserVerificationDocumentSummary>;
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
  UserVerificationSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserVerificationSummaryBuilder();
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

class UserVerificationSummaryStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const UserVerificationSummaryStatusEnum PENDING = _$userVerificationSummaryStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const UserVerificationSummaryStatusEnum ACTION_REQUIRED = _$userVerificationSummaryStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const UserVerificationSummaryStatusEnum APPROVED = _$userVerificationSummaryStatusEnum_APPROVED;

  static Serializer<UserVerificationSummaryStatusEnum> get serializer => _$userVerificationSummaryStatusEnumSerializer;

  const UserVerificationSummaryStatusEnum._(String name): super(name);

  static BuiltSet<UserVerificationSummaryStatusEnum> get values => _$userVerificationSummaryStatusEnumValues;
  static UserVerificationSummaryStatusEnum valueOf(String name) => _$userVerificationSummaryStatusEnumValueOf(name);
}

