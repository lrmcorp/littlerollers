//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_role_summary_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_role_summary.g.dart';

/// UserRoleSummary
///
/// Properties:
/// * [role] 
/// * [branchId] 
/// * [branch] 
/// * [source_] 
@BuiltValue()
abstract class UserRoleSummary implements Built<UserRoleSummary, UserRoleSummaryBuilder> {
  @BuiltValueField(wireName: r'role')
  Role get role;
  // enum roleEnum {  CUSTOMER,  INSTRUCTOR,  ADMIN,  MANAGER,  OWNER,  SUPER_OWNER,  FINANCE,  OPS,  };

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'branch')
  UserRoleSummaryBranch? get branch;

  @BuiltValueField(wireName: r'source')
  UserRoleSummarySource_Enum get source_;
  // enum source_Enum {  DIRECT,  ASSIGNMENT,  };

  UserRoleSummary._();

  factory UserRoleSummary([void updates(UserRoleSummaryBuilder b)]) = _$UserRoleSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserRoleSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserRoleSummary> get serializer => _$UserRoleSummarySerializer();
}

class _$UserRoleSummarySerializer implements PrimitiveSerializer<UserRoleSummary> {
  @override
  final Iterable<Type> types = const [UserRoleSummary, _$UserRoleSummary];

  @override
  final String wireName = r'UserRoleSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserRoleSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(Role),
    );
    yield r'branchId';
    yield object.branchId == null ? null : serializers.serialize(
      object.branchId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'branch';
    yield object.branch == null ? null : serializers.serialize(
      object.branch,
      specifiedType: const FullType.nullable(UserRoleSummaryBranch),
    );
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(UserRoleSummarySource_Enum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserRoleSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserRoleSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Role),
          ) as Role;
          result.role = valueDes;
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
            specifiedType: const FullType.nullable(UserRoleSummaryBranch),
          ) as UserRoleSummaryBranch?;
          if (valueDes == null) continue;
          result.branch.replace(valueDes);
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserRoleSummarySource_Enum),
          ) as UserRoleSummarySource_Enum;
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
  UserRoleSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserRoleSummaryBuilder();
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

class UserRoleSummarySource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DIRECT')
  static const UserRoleSummarySource_Enum DIRECT = _$userRoleSummarySourceEnum_DIRECT;
  @BuiltValueEnumConst(wireName: r'ASSIGNMENT')
  static const UserRoleSummarySource_Enum ASSIGNMENT = _$userRoleSummarySourceEnum_ASSIGNMENT;

  static Serializer<UserRoleSummarySource_Enum> get serializer => _$userRoleSummarySourceEnumSerializer;

  const UserRoleSummarySource_Enum._(String name): super(name);

  static BuiltSet<UserRoleSummarySource_Enum> get values => _$userRoleSummarySourceEnumValues;
  static UserRoleSummarySource_Enum valueOf(String name) => _$userRoleSummarySourceEnumValueOf(name);
}

