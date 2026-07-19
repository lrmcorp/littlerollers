//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'version_command.g.dart';

/// VersionCommand
///
/// Properties:
/// * [expectedVersion] 
@BuiltValue()
abstract class VersionCommand implements Built<VersionCommand, VersionCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  VersionCommand._();

  factory VersionCommand([void updates(VersionCommandBuilder b)]) = _$VersionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VersionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VersionCommand> get serializer => _$VersionCommandSerializer();
}

class _$VersionCommandSerializer implements PrimitiveSerializer<VersionCommand> {
  @override
  final Iterable<Type> types = const [VersionCommand, _$VersionCommand];

  @override
  final String wireName = r'VersionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VersionCommand object, {
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
    VersionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VersionCommandBuilder result,
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
  VersionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VersionCommandBuilder();
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

