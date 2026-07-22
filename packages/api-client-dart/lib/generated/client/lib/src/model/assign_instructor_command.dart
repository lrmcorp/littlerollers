//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assign_instructor_command.g.dart';

/// AssignInstructorCommand
///
/// Properties:
/// * [instructorUserId] 
/// * [expectedVersion] 
@BuiltValue()
abstract class AssignInstructorCommand implements Built<AssignInstructorCommand, AssignInstructorCommandBuilder> {
  @BuiltValueField(wireName: r'instructorUserId')
  String get instructorUserId;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  AssignInstructorCommand._();

  factory AssignInstructorCommand([void updates(AssignInstructorCommandBuilder b)]) = _$AssignInstructorCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignInstructorCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignInstructorCommand> get serializer => _$AssignInstructorCommandSerializer();
}

class _$AssignInstructorCommandSerializer implements PrimitiveSerializer<AssignInstructorCommand> {
  @override
  final Iterable<Type> types = const [AssignInstructorCommand, _$AssignInstructorCommand];

  @override
  final String wireName = r'AssignInstructorCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignInstructorCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'instructorUserId';
    yield serializers.serialize(
      object.instructorUserId,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignInstructorCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignInstructorCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.instructorUserId = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignInstructorCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignInstructorCommandBuilder();
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

