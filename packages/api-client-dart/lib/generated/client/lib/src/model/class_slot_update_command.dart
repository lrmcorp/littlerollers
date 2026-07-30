//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot_update_command.g.dart';

/// ClassSlotUpdateCommand
///
/// Properties:
/// * [classTypeId] 
/// * [instructorUserId] 
/// * [startAt] 
/// * [endAt] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class ClassSlotUpdateCommand implements Built<ClassSlotUpdateCommand, ClassSlotUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'instructorUserId')
  String? get instructorUserId;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  ClassSlotUpdateCommand._();

  factory ClassSlotUpdateCommand([void updates(ClassSlotUpdateCommandBuilder b)]) = _$ClassSlotUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlotUpdateCommand> get serializer => _$ClassSlotUpdateCommandSerializer();
}

class _$ClassSlotUpdateCommandSerializer implements PrimitiveSerializer<ClassSlotUpdateCommand> {
  @override
  final Iterable<Type> types = const [ClassSlotUpdateCommand, _$ClassSlotUpdateCommand];

  @override
  final String wireName = r'ClassSlotUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlotUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    if (object.instructorUserId != null) {
      yield r'instructorUserId';
      yield serializers.serialize(
        object.instructorUserId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassSlotUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotUpdateCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.instructorUserId = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
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
  ClassSlotUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotUpdateCommandBuilder();
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

