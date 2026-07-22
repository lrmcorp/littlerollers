//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot_version_command.g.dart';

/// ClassSlotVersionCommand
///
/// Properties:
/// * [expectedVersion] 
@BuiltValue()
abstract class ClassSlotVersionCommand implements Built<ClassSlotVersionCommand, ClassSlotVersionCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  ClassSlotVersionCommand._();

  factory ClassSlotVersionCommand([void updates(ClassSlotVersionCommandBuilder b)]) = _$ClassSlotVersionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotVersionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlotVersionCommand> get serializer => _$ClassSlotVersionCommandSerializer();
}

class _$ClassSlotVersionCommandSerializer implements PrimitiveSerializer<ClassSlotVersionCommand> {
  @override
  final Iterable<Type> types = const [ClassSlotVersionCommand, _$ClassSlotVersionCommand];

  @override
  final String wireName = r'ClassSlotVersionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlotVersionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassSlotVersionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotVersionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  ClassSlotVersionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotVersionCommandBuilder();
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

