//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_type_update_command.g.dart';

/// ClassTypeUpdateCommand
///
/// Properties:
/// * [name] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class ClassTypeUpdateCommand implements Built<ClassTypeUpdateCommand, ClassTypeUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  ClassTypeUpdateCommand._();

  factory ClassTypeUpdateCommand([void updates(ClassTypeUpdateCommandBuilder b)]) = _$ClassTypeUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassTypeUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassTypeUpdateCommand> get serializer => _$ClassTypeUpdateCommandSerializer();
}

class _$ClassTypeUpdateCommandSerializer implements PrimitiveSerializer<ClassTypeUpdateCommand> {
  @override
  final Iterable<Type> types = const [ClassTypeUpdateCommand, _$ClassTypeUpdateCommand];

  @override
  final String wireName = r'ClassTypeUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassTypeUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
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
    ClassTypeUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassTypeUpdateCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
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
  ClassTypeUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassTypeUpdateCommandBuilder();
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

