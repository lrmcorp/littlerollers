//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot_cancellation_command.g.dart';

/// ClassSlotCancellationCommand
///
/// Properties:
/// * [reasonCode] 
/// * [expectedVersion] 
@BuiltValue()
abstract class ClassSlotCancellationCommand implements Built<ClassSlotCancellationCommand, ClassSlotCancellationCommandBuilder> {
  @BuiltValueField(wireName: r'reasonCode')
  ClassSlotCancellationCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  STUDIO_UNAVAILABLE,  INSTRUCTOR_UNAVAILABLE,  SAFETY_ISSUE,  OTHER_REVIEW_REQUIRED,  };

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  ClassSlotCancellationCommand._();

  factory ClassSlotCancellationCommand([void updates(ClassSlotCancellationCommandBuilder b)]) = _$ClassSlotCancellationCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotCancellationCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlotCancellationCommand> get serializer => _$ClassSlotCancellationCommandSerializer();
}

class _$ClassSlotCancellationCommandSerializer implements PrimitiveSerializer<ClassSlotCancellationCommand> {
  @override
  final Iterable<Type> types = const [ClassSlotCancellationCommand, _$ClassSlotCancellationCommand];

  @override
  final String wireName = r'ClassSlotCancellationCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlotCancellationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(ClassSlotCancellationCommandReasonCodeEnum),
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
    ClassSlotCancellationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotCancellationCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ClassSlotCancellationCommandReasonCodeEnum),
          ) as ClassSlotCancellationCommandReasonCodeEnum;
          result.reasonCode = valueDes;
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
  ClassSlotCancellationCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotCancellationCommandBuilder();
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

class ClassSlotCancellationCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'STUDIO_UNAVAILABLE')
  static const ClassSlotCancellationCommandReasonCodeEnum STUDIO_UNAVAILABLE = _$classSlotCancellationCommandReasonCodeEnum_STUDIO_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_UNAVAILABLE')
  static const ClassSlotCancellationCommandReasonCodeEnum INSTRUCTOR_UNAVAILABLE = _$classSlotCancellationCommandReasonCodeEnum_INSTRUCTOR_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'SAFETY_ISSUE')
  static const ClassSlotCancellationCommandReasonCodeEnum SAFETY_ISSUE = _$classSlotCancellationCommandReasonCodeEnum_SAFETY_ISSUE;
  @BuiltValueEnumConst(wireName: r'OTHER_REVIEW_REQUIRED')
  static const ClassSlotCancellationCommandReasonCodeEnum OTHER_REVIEW_REQUIRED = _$classSlotCancellationCommandReasonCodeEnum_OTHER_REVIEW_REQUIRED;

  static Serializer<ClassSlotCancellationCommandReasonCodeEnum> get serializer => _$classSlotCancellationCommandReasonCodeEnumSerializer;

  const ClassSlotCancellationCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<ClassSlotCancellationCommandReasonCodeEnum> get values => _$classSlotCancellationCommandReasonCodeEnumValues;
  static ClassSlotCancellationCommandReasonCodeEnum valueOf(String name) => _$classSlotCancellationCommandReasonCodeEnumValueOf(name);
}

