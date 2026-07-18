//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment_command.g.dart';

/// AssignmentCommand
///
/// Properties:
/// * [userId] 
/// * [branchId] 
/// * [assignmentType] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [reason] 
@BuiltValue()
abstract class AssignmentCommand implements Built<AssignmentCommand, AssignmentCommandBuilder> {
  @BuiltValueField(wireName: r'userId')
  String get userId;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'assignmentType')
  AssignmentCommandAssignmentTypeEnum get assignmentType;
  // enum assignmentTypeEnum {  OWNER,  INSTRUCTOR,  };

  @BuiltValueField(wireName: r'activeFrom')
  Date get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  Date? get activeUntil;

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  AssignmentCommand._();

  factory AssignmentCommand([void updates(AssignmentCommandBuilder b)]) = _$AssignmentCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignmentCommand> get serializer => _$AssignmentCommandSerializer();
}

class _$AssignmentCommandSerializer implements PrimitiveSerializer<AssignmentCommand> {
  @override
  final Iterable<Type> types = const [AssignmentCommand, _$AssignmentCommand];

  @override
  final String wireName = r'AssignmentCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
      specifiedType: const FullType(AssignmentCommandAssignmentTypeEnum),
    );
    yield r'activeFrom';
    yield serializers.serialize(
      object.activeFrom,
      specifiedType: const FullType(Date),
    );
    if (object.activeUntil != null) {
      yield r'activeUntil';
      yield serializers.serialize(
        object.activeUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(AssignmentCommandAssignmentTypeEnum),
          ) as AssignmentCommandAssignmentTypeEnum;
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignmentCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentCommandBuilder();
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

class AssignmentCommandAssignmentTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OWNER')
  static const AssignmentCommandAssignmentTypeEnum OWNER = _$assignmentCommandAssignmentTypeEnum_OWNER;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR')
  static const AssignmentCommandAssignmentTypeEnum INSTRUCTOR = _$assignmentCommandAssignmentTypeEnum_INSTRUCTOR;

  static Serializer<AssignmentCommandAssignmentTypeEnum> get serializer => _$assignmentCommandAssignmentTypeEnumSerializer;

  const AssignmentCommandAssignmentTypeEnum._(String name): super(name);

  static BuiltSet<AssignmentCommandAssignmentTypeEnum> get values => _$assignmentCommandAssignmentTypeEnumValues;
  static AssignmentCommandAssignmentTypeEnum valueOf(String name) => _$assignmentCommandAssignmentTypeEnumValueOf(name);
}

