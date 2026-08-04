//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot_command.g.dart';

/// ClassSlotCommand
///
/// Properties:
/// * [branchId] 
/// * [classTypeId] 
/// * [studioId] 
/// * [roomId] 
/// * [instructorUserId] 
/// * [startAt] - RFC3339 with numeric offset or Z
/// * [endAt] - Exclusive RFC3339 boundary with numeric offset or Z
@BuiltValue()
abstract class ClassSlotCommand implements Built<ClassSlotCommand, ClassSlotCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'studioId')
  String get studioId;

  @BuiltValueField(wireName: r'roomId')
  String? get roomId;

  @BuiltValueField(wireName: r'instructorUserId')
  String? get instructorUserId;

  /// RFC3339 with numeric offset or Z
  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  /// Exclusive RFC3339 boundary with numeric offset or Z
  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  ClassSlotCommand._();

  factory ClassSlotCommand([void updates(ClassSlotCommandBuilder b)]) = _$ClassSlotCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlotCommand> get serializer => _$ClassSlotCommandSerializer();
}

class _$ClassSlotCommandSerializer implements PrimitiveSerializer<ClassSlotCommand> {
  @override
  final Iterable<Type> types = const [ClassSlotCommand, _$ClassSlotCommand];

  @override
  final String wireName = r'ClassSlotCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlotCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'studioId';
    yield serializers.serialize(
      object.studioId,
      specifiedType: const FullType(String),
    );
    if (object.roomId != null) {
      yield r'roomId';
      yield serializers.serialize(
        object.roomId,
        specifiedType: const FullType(String),
      );
    }
    if (object.instructorUserId != null) {
      yield r'instructorUserId';
      yield serializers.serialize(
        object.instructorUserId,
        specifiedType: const FullType(String),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassSlotCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'studioId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.studioId = valueDes;
          break;
        case r'roomId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.roomId = valueDes;
          break;
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassSlotCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotCommandBuilder();
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

