//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'studio_update_command.g.dart';

/// StudioUpdateCommand
///
/// Properties:
/// * [name] 
/// * [equipmentText] 
/// * [contactPhoneE164] 
/// * [active] 
@BuiltValue()
abstract class StudioUpdateCommand implements Built<StudioUpdateCommand, StudioUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'equipmentText')
  String? get equipmentText;

  @BuiltValueField(wireName: r'contactPhoneE164')
  String? get contactPhoneE164;

  @BuiltValueField(wireName: r'active')
  bool? get active;

  StudioUpdateCommand._();

  factory StudioUpdateCommand([void updates(StudioUpdateCommandBuilder b)]) = _$StudioUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StudioUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StudioUpdateCommand> get serializer => _$StudioUpdateCommandSerializer();
}

class _$StudioUpdateCommandSerializer implements PrimitiveSerializer<StudioUpdateCommand> {
  @override
  final Iterable<Type> types = const [StudioUpdateCommand, _$StudioUpdateCommand];

  @override
  final String wireName = r'StudioUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StudioUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    if (object.equipmentText != null) {
      yield r'equipmentText';
      yield serializers.serialize(
        object.equipmentText,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.contactPhoneE164 != null) {
      yield r'contactPhoneE164';
      yield serializers.serialize(
        object.contactPhoneE164,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.active != null) {
      yield r'active';
      yield serializers.serialize(
        object.active,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    StudioUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StudioUpdateCommandBuilder result,
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
        case r'equipmentText':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.equipmentText = valueDes;
          break;
        case r'contactPhoneE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactPhoneE164 = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StudioUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StudioUpdateCommandBuilder();
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

