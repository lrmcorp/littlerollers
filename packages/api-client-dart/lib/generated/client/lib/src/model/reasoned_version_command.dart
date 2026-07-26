//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reasoned_version_command.g.dart';

/// ReasonedVersionCommand
///
/// Properties:
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class ReasonedVersionCommand implements Built<ReasonedVersionCommand, ReasonedVersionCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  ReasonedVersionCommand._();

  factory ReasonedVersionCommand([void updates(ReasonedVersionCommandBuilder b)]) = _$ReasonedVersionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReasonedVersionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReasonedVersionCommand> get serializer => _$ReasonedVersionCommandSerializer();
}

class _$ReasonedVersionCommandSerializer implements PrimitiveSerializer<ReasonedVersionCommand> {
  @override
  final Iterable<Type> types = const [ReasonedVersionCommand, _$ReasonedVersionCommand];

  @override
  final String wireName = r'ReasonedVersionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReasonedVersionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    ReasonedVersionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReasonedVersionCommandBuilder result,
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
  ReasonedVersionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReasonedVersionCommandBuilder();
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

