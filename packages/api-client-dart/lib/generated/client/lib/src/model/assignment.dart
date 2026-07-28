//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/assignment_management_branch.dart';
import 'package:openapi/src/model/assignment_management_user.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment.g.dart';

/// Effective assignment interval [activeFrom, activeUntil) interpreted as calendar dates in the branch IANA timezone. Null activeUntil means open-ended.
///
/// Properties:
/// * [id] 
/// * [userId] 
/// * [branchId] 
/// * [assignmentType] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [status] 
/// * [user] 
/// * [branch] 
/// * [version] 
@BuiltValue()
abstract class Assignment implements Built<Assignment, AssignmentBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'userId')
  String get userId;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'assignmentType')
  AssignmentAssignmentTypeEnum get assignmentType;
  // enum assignmentTypeEnum {  OWNER,  INSTRUCTOR,  };

  @BuiltValueField(wireName: r'activeFrom')
  Date get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  Date? get activeUntil;

  @BuiltValueField(wireName: r'status')
  AssignmentStatusEnum get status;
  // enum statusEnum {  ACTIVE,  ENDED,  };

  @BuiltValueField(wireName: r'user')
  AssignmentManagementUser get user;

  @BuiltValueField(wireName: r'branch')
  AssignmentManagementBranch get branch;

  @BuiltValueField(wireName: r'version')
  int get version;

  Assignment._();

  factory Assignment([void updates(AssignmentBuilder b)]) = _$Assignment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Assignment> get serializer => _$AssignmentSerializer();
}

class _$AssignmentSerializer implements PrimitiveSerializer<Assignment> {
  @override
  final Iterable<Type> types = const [Assignment, _$Assignment];

  @override
  final String wireName = r'Assignment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Assignment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'userId';
    yield serializers.serialize(
      object.userId,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'assignmentType';
    yield serializers.serialize(
      object.assignmentType,
      specifiedType: const FullType(AssignmentAssignmentTypeEnum),
    );
    yield r'activeFrom';
    yield serializers.serialize(
      object.activeFrom,
      specifiedType: const FullType(Date),
    );
    yield r'activeUntil';
    yield object.activeUntil == null ? null : serializers.serialize(
      object.activeUntil,
      specifiedType: const FullType.nullable(Date),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(AssignmentStatusEnum),
    );
    yield r'user';
    yield serializers.serialize(
      object.user,
      specifiedType: const FullType(AssignmentManagementUser),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(AssignmentManagementBranch),
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
    Assignment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentBuilder result,
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
        case r'userId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.userId = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'assignmentType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AssignmentAssignmentTypeEnum),
          ) as AssignmentAssignmentTypeEnum;
          result.assignmentType = valueDes;
          break;
        case r'activeFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.activeFrom = valueDes;
          break;
        case r'activeUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.activeUntil = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AssignmentStatusEnum),
          ) as AssignmentStatusEnum;
          result.status = valueDes;
          break;
        case r'user':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AssignmentManagementUser),
          ) as AssignmentManagementUser;
          result.user.replace(valueDes);
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AssignmentManagementBranch),
          ) as AssignmentManagementBranch;
          result.branch.replace(valueDes);
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
  Assignment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentBuilder();
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

class AssignmentAssignmentTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OWNER')
  static const AssignmentAssignmentTypeEnum OWNER = _$assignmentAssignmentTypeEnum_OWNER;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR')
  static const AssignmentAssignmentTypeEnum INSTRUCTOR = _$assignmentAssignmentTypeEnum_INSTRUCTOR;

  static Serializer<AssignmentAssignmentTypeEnum> get serializer => _$assignmentAssignmentTypeEnumSerializer;

  const AssignmentAssignmentTypeEnum._(String name): super(name);

  static BuiltSet<AssignmentAssignmentTypeEnum> get values => _$assignmentAssignmentTypeEnumValues;
  static AssignmentAssignmentTypeEnum valueOf(String name) => _$assignmentAssignmentTypeEnumValueOf(name);
}

class AssignmentStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const AssignmentStatusEnum ACTIVE = _$assignmentStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'ENDED')
  static const AssignmentStatusEnum ENDED = _$assignmentStatusEnum_ENDED;

  static Serializer<AssignmentStatusEnum> get serializer => _$assignmentStatusEnumSerializer;

  const AssignmentStatusEnum._(String name): super(name);

  static BuiltSet<AssignmentStatusEnum> get values => _$assignmentStatusEnumValues;
  static AssignmentStatusEnum valueOf(String name) => _$assignmentStatusEnumValueOf(name);
}

