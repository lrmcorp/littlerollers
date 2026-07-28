//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_review_user.g.dart';

/// IdentityVerificationReviewUser
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [phoneMasked] 
/// * [status] 
@BuiltValue()
abstract class IdentityVerificationReviewUser implements Built<IdentityVerificationReviewUser, IdentityVerificationReviewUserBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phoneMasked')
  String? get phoneMasked;

  @BuiltValueField(wireName: r'status')
  IdentityVerificationReviewUserStatusEnum get status;
  // enum statusEnum {  PENDING_ACTIVATION,  ACTIVE,  INACTIVE,  };

  IdentityVerificationReviewUser._();

  factory IdentityVerificationReviewUser([void updates(IdentityVerificationReviewUserBuilder b)]) = _$IdentityVerificationReviewUser;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationReviewUserBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationReviewUser> get serializer => _$IdentityVerificationReviewUserSerializer();
}

class _$IdentityVerificationReviewUserSerializer implements PrimitiveSerializer<IdentityVerificationReviewUser> {
  @override
  final Iterable<Type> types = const [IdentityVerificationReviewUser, _$IdentityVerificationReviewUser];

  @override
  final String wireName = r'IdentityVerificationReviewUser';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationReviewUser object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'phoneMasked';
    yield object.phoneMasked == null ? null : serializers.serialize(
      object.phoneMasked,
      specifiedType: const FullType.nullable(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(IdentityVerificationReviewUserStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewUser object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationReviewUserBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'phoneMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phoneMasked = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationReviewUserStatusEnum),
          ) as IdentityVerificationReviewUserStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationReviewUser deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationReviewUserBuilder();
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

class IdentityVerificationReviewUserStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING_ACTIVATION')
  static const IdentityVerificationReviewUserStatusEnum PENDING_ACTIVATION = _$identityVerificationReviewUserStatusEnum_PENDING_ACTIVATION;
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const IdentityVerificationReviewUserStatusEnum ACTIVE = _$identityVerificationReviewUserStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const IdentityVerificationReviewUserStatusEnum INACTIVE = _$identityVerificationReviewUserStatusEnum_INACTIVE;

  static Serializer<IdentityVerificationReviewUserStatusEnum> get serializer => _$identityVerificationReviewUserStatusEnumSerializer;

  const IdentityVerificationReviewUserStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationReviewUserStatusEnum> get values => _$identityVerificationReviewUserStatusEnumValues;
  static IdentityVerificationReviewUserStatusEnum valueOf(String name) => _$identityVerificationReviewUserStatusEnumValueOf(name);
}

