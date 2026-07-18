//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'recovery_request_command.g.dart';

/// RecoveryRequestCommand
///
/// Properties:
/// * [identifier] - Never echoed or logged verbatim
/// * [requestedChannel] 
@BuiltValue()
abstract class RecoveryRequestCommand implements Built<RecoveryRequestCommand, RecoveryRequestCommandBuilder> {
  /// Never echoed or logged verbatim
  @BuiltValueField(wireName: r'identifier')
  String get identifier;

  @BuiltValueField(wireName: r'requestedChannel')
  RecoveryRequestCommandRequestedChannelEnum get requestedChannel;
  // enum requestedChannelEnum {  WHATSAPP,  GOOGLE,  SUPPORT,  };

  RecoveryRequestCommand._();

  factory RecoveryRequestCommand([void updates(RecoveryRequestCommandBuilder b)]) = _$RecoveryRequestCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RecoveryRequestCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RecoveryRequestCommand> get serializer => _$RecoveryRequestCommandSerializer();
}

class _$RecoveryRequestCommandSerializer implements PrimitiveSerializer<RecoveryRequestCommand> {
  @override
  final Iterable<Type> types = const [RecoveryRequestCommand, _$RecoveryRequestCommand];

  @override
  final String wireName = r'RecoveryRequestCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RecoveryRequestCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'identifier';
    yield serializers.serialize(
      object.identifier,
      specifiedType: const FullType(String),
    );
    yield r'requestedChannel';
    yield serializers.serialize(
      object.requestedChannel,
      specifiedType: const FullType(RecoveryRequestCommandRequestedChannelEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RecoveryRequestCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RecoveryRequestCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'identifier':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.identifier = valueDes;
          break;
        case r'requestedChannel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RecoveryRequestCommandRequestedChannelEnum),
          ) as RecoveryRequestCommandRequestedChannelEnum;
          result.requestedChannel = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RecoveryRequestCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RecoveryRequestCommandBuilder();
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

class RecoveryRequestCommandRequestedChannelEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WHATSAPP')
  static const RecoveryRequestCommandRequestedChannelEnum WHATSAPP = _$recoveryRequestCommandRequestedChannelEnum_WHATSAPP;
  @BuiltValueEnumConst(wireName: r'GOOGLE')
  static const RecoveryRequestCommandRequestedChannelEnum GOOGLE = _$recoveryRequestCommandRequestedChannelEnum_GOOGLE;
  @BuiltValueEnumConst(wireName: r'SUPPORT')
  static const RecoveryRequestCommandRequestedChannelEnum SUPPORT = _$recoveryRequestCommandRequestedChannelEnum_SUPPORT;

  static Serializer<RecoveryRequestCommandRequestedChannelEnum> get serializer => _$recoveryRequestCommandRequestedChannelEnumSerializer;

  const RecoveryRequestCommandRequestedChannelEnum._(String name): super(name);

  static BuiltSet<RecoveryRequestCommandRequestedChannelEnum> get values => _$recoveryRequestCommandRequestedChannelEnumValues;
  static RecoveryRequestCommandRequestedChannelEnum valueOf(String name) => _$recoveryRequestCommandRequestedChannelEnumValueOf(name);
}

