//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'revoke_sessions_command.g.dart';

/// RevokeSessionsCommand
///
/// Properties:
/// * [exceptCurrent] 
/// * [reason] 
@BuiltValue()
abstract class RevokeSessionsCommand implements Built<RevokeSessionsCommand, RevokeSessionsCommandBuilder> {
  @BuiltValueField(wireName: r'exceptCurrent')
  bool? get exceptCurrent;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  RevokeSessionsCommand._();

  factory RevokeSessionsCommand([void updates(RevokeSessionsCommandBuilder b)]) = _$RevokeSessionsCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RevokeSessionsCommandBuilder b) => b
      ..exceptCurrent = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<RevokeSessionsCommand> get serializer => _$RevokeSessionsCommandSerializer();
}

class _$RevokeSessionsCommandSerializer implements PrimitiveSerializer<RevokeSessionsCommand> {
  @override
  final Iterable<Type> types = const [RevokeSessionsCommand, _$RevokeSessionsCommand];

  @override
  final String wireName = r'RevokeSessionsCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RevokeSessionsCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.exceptCurrent != null) {
      yield r'exceptCurrent';
      yield serializers.serialize(
        object.exceptCurrent,
        specifiedType: const FullType(bool),
      );
    }
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RevokeSessionsCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RevokeSessionsCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'exceptCurrent':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.exceptCurrent = valueDes;
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
  RevokeSessionsCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RevokeSessionsCommandBuilder();
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

