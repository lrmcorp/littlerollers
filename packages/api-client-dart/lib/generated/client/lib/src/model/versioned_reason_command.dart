//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'versioned_reason_command.g.dart';

/// VersionedReasonCommand
///
/// Properties:
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class VersionedReasonCommand implements Built<VersionedReasonCommand, VersionedReasonCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  VersionedReasonCommand._();

  factory VersionedReasonCommand([void updates(VersionedReasonCommandBuilder b)]) = _$VersionedReasonCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VersionedReasonCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VersionedReasonCommand> get serializer => _$VersionedReasonCommandSerializer();
}

class _$VersionedReasonCommandSerializer implements PrimitiveSerializer<VersionedReasonCommand> {
  @override
  final Iterable<Type> types = const [VersionedReasonCommand, _$VersionedReasonCommand];

  @override
  final String wireName = r'VersionedReasonCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VersionedReasonCommand object, {
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
    VersionedReasonCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VersionedReasonCommandBuilder result,
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
  VersionedReasonCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VersionedReasonCommandBuilder();
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

