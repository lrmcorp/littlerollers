//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_role_scope.dart';
import 'package:openapi/src/model/user_access_role_assignment_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_access_role_assignment.g.dart';

/// UserAccessRoleAssignment
///
/// Properties:
/// * [id] 
/// * [roleId] 
/// * [roleCode] 
/// * [displayName] 
/// * [scope] 
/// * [branchId] 
/// * [branch] 
/// * [source_] 
@BuiltValue()
abstract class UserAccessRoleAssignment implements Built<UserAccessRoleAssignment, UserAccessRoleAssignmentBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'roleId')
  String? get roleId;

  @BuiltValueField(wireName: r'roleCode')
  String get roleCode;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'scope')
  AccessRoleScope get scope;
  // enum scopeEnum {  GLOBAL,  BRANCH,  };

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'branch')
  UserAccessRoleAssignmentBranch? get branch;

  @BuiltValueField(wireName: r'source')
  UserAccessRoleAssignmentSource_Enum get source_;
  // enum source_Enum {  DIRECT,  ASSIGNMENT,  };

  UserAccessRoleAssignment._();

  factory UserAccessRoleAssignment([void updates(UserAccessRoleAssignmentBuilder b)]) = _$UserAccessRoleAssignment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserAccessRoleAssignmentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserAccessRoleAssignment> get serializer => _$UserAccessRoleAssignmentSerializer();
}

class _$UserAccessRoleAssignmentSerializer implements PrimitiveSerializer<UserAccessRoleAssignment> {
  @override
  final Iterable<Type> types = const [UserAccessRoleAssignment, _$UserAccessRoleAssignment];

  @override
  final String wireName = r'UserAccessRoleAssignment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserAccessRoleAssignment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'roleId';
    yield object.roleId == null ? null : serializers.serialize(
      object.roleId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'roleCode';
    yield serializers.serialize(
      object.roleCode,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(AccessRoleScope),
    );
    yield r'branchId';
    yield object.branchId == null ? null : serializers.serialize(
      object.branchId,
      specifiedType: const FullType.nullable(String),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(UserAccessRoleAssignmentBranch),
      );
    }
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(UserAccessRoleAssignmentSource_Enum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserAccessRoleAssignment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserAccessRoleAssignmentBuilder result,
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
        case r'roleId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.roleId = valueDes;
          break;
        case r'roleCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.roleCode = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessRoleScope),
          ) as AccessRoleScope;
          result.scope = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessRoleAssignmentBranch),
          ) as UserAccessRoleAssignmentBranch;
          result.branch.replace(valueDes);
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessRoleAssignmentSource_Enum),
          ) as UserAccessRoleAssignmentSource_Enum;
          result.source_ = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserAccessRoleAssignment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserAccessRoleAssignmentBuilder();
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

class UserAccessRoleAssignmentSource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DIRECT')
  static const UserAccessRoleAssignmentSource_Enum DIRECT = _$userAccessRoleAssignmentSourceEnum_DIRECT;
  @BuiltValueEnumConst(wireName: r'ASSIGNMENT')
  static const UserAccessRoleAssignmentSource_Enum ASSIGNMENT = _$userAccessRoleAssignmentSourceEnum_ASSIGNMENT;

  static Serializer<UserAccessRoleAssignmentSource_Enum> get serializer => _$userAccessRoleAssignmentSourceEnumSerializer;

  const UserAccessRoleAssignmentSource_Enum._(String name): super(name);

  static BuiltSet<UserAccessRoleAssignmentSource_Enum> get values => _$userAccessRoleAssignmentSourceEnumValues;
  static UserAccessRoleAssignmentSource_Enum valueOf(String name) => _$userAccessRoleAssignmentSourceEnumValueOf(name);
}

