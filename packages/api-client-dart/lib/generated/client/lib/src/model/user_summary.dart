//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/user_role_summary.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_summary.g.dart';

/// UserSummary
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [phoneE164] 
/// * [status] 
/// * [version] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [roles] 
/// * [directRoles] 
/// * [assignmentRoles] 
/// * [effectiveCapabilities] 
@BuiltValue()
abstract class UserSummary implements Built<UserSummary, UserSummaryBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phoneE164')
  String? get phoneE164;

  @BuiltValueField(wireName: r'status')
  UserSummaryStatusEnum get status;
  // enum statusEnum {  PENDING_ACTIVATION,  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'roles')
  BuiltList<UserRoleSummary> get roles;

  @BuiltValueField(wireName: r'directRoles')
  BuiltList<UserRoleSummary> get directRoles;

  @BuiltValueField(wireName: r'assignmentRoles')
  BuiltList<UserRoleSummary> get assignmentRoles;

  @BuiltValueField(wireName: r'effectiveCapabilities')
  BuiltList<String> get effectiveCapabilities;

  UserSummary._();

  factory UserSummary([void updates(UserSummaryBuilder b)]) = _$UserSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserSummary> get serializer => _$UserSummarySerializer();
}

class _$UserSummarySerializer implements PrimitiveSerializer<UserSummary> {
  @override
  final Iterable<Type> types = const [UserSummary, _$UserSummary];

  @override
  final String wireName = r'UserSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserSummary object, {
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
    yield r'phoneE164';
    yield object.phoneE164 == null ? null : serializers.serialize(
      object.phoneE164,
      specifiedType: const FullType.nullable(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(UserSummaryStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'roles';
    yield serializers.serialize(
      object.roles,
      specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
    );
    yield r'directRoles';
    yield serializers.serialize(
      object.directRoles,
      specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
    );
    yield r'assignmentRoles';
    yield serializers.serialize(
      object.assignmentRoles,
      specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
    );
    yield r'effectiveCapabilities';
    yield serializers.serialize(
      object.effectiveCapabilities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserSummaryBuilder result,
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
        case r'phoneE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phoneE164 = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserSummaryStatusEnum),
          ) as UserSummaryStatusEnum;
          result.status = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
          ) as BuiltList<UserRoleSummary>;
          result.roles.replace(valueDes);
          break;
        case r'directRoles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
          ) as BuiltList<UserRoleSummary>;
          result.directRoles.replace(valueDes);
          break;
        case r'assignmentRoles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserRoleSummary)]),
          ) as BuiltList<UserRoleSummary>;
          result.assignmentRoles.replace(valueDes);
          break;
        case r'effectiveCapabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.effectiveCapabilities.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserSummaryBuilder();
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

class UserSummaryStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING_ACTIVATION')
  static const UserSummaryStatusEnum PENDING_ACTIVATION = _$userSummaryStatusEnum_PENDING_ACTIVATION;
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const UserSummaryStatusEnum ACTIVE = _$userSummaryStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const UserSummaryStatusEnum INACTIVE = _$userSummaryStatusEnum_INACTIVE;

  static Serializer<UserSummaryStatusEnum> get serializer => _$userSummaryStatusEnumSerializer;

  const UserSummaryStatusEnum._(String name): super(name);

  static BuiltSet<UserSummaryStatusEnum> get values => _$userSummaryStatusEnumValues;
  static UserSummaryStatusEnum valueOf(String name) => _$userSummaryStatusEnumValueOf(name);
}

