//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_access_user.g.dart';

/// UserAccessUser
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [status] 
/// * [version] 
@BuiltValue()
abstract class UserAccessUser implements Built<UserAccessUser, UserAccessUserBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'status')
  UserAccessUserStatusEnum get status;
  // enum statusEnum {  PENDING_ACTIVATION,  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  UserAccessUser._();

  factory UserAccessUser([void updates(UserAccessUserBuilder b)]) = _$UserAccessUser;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserAccessUserBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserAccessUser> get serializer => _$UserAccessUserSerializer();
}

class _$UserAccessUserSerializer implements PrimitiveSerializer<UserAccessUser> {
  @override
  final Iterable<Type> types = const [UserAccessUser, _$UserAccessUser];

  @override
  final String wireName = r'UserAccessUser';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserAccessUser object, {
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(UserAccessUserStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserAccessUser object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserAccessUserBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessUserStatusEnum),
          ) as UserAccessUserStatusEnum;
          result.status = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserAccessUser deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserAccessUserBuilder();
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

class UserAccessUserStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING_ACTIVATION')
  static const UserAccessUserStatusEnum PENDING_ACTIVATION = _$userAccessUserStatusEnum_PENDING_ACTIVATION;
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const UserAccessUserStatusEnum ACTIVE = _$userAccessUserStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const UserAccessUserStatusEnum INACTIVE = _$userAccessUserStatusEnum_INACTIVE;

  static Serializer<UserAccessUserStatusEnum> get serializer => _$userAccessUserStatusEnumSerializer;

  const UserAccessUserStatusEnum._(String name): super(name);

  static BuiltSet<UserAccessUserStatusEnum> get values => _$userAccessUserStatusEnumValues;
  static UserAccessUserStatusEnum valueOf(String name) => _$userAccessUserStatusEnumValueOf(name);
}

