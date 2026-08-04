//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'studio_command.g.dart';

/// StudioCommand
///
/// Properties:
/// * [code] 
/// * [name] 
/// * [equipmentText] 
/// * [contactPhoneE164] 
@BuiltValue()
abstract class StudioCommand implements Built<StudioCommand, StudioCommandBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'equipmentText')
  String? get equipmentText;

  @BuiltValueField(wireName: r'contactPhoneE164')
  String? get contactPhoneE164;

  StudioCommand._();

  factory StudioCommand([void updates(StudioCommandBuilder b)]) = _$StudioCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StudioCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StudioCommand> get serializer => _$StudioCommandSerializer();
}

class _$StudioCommandSerializer implements PrimitiveSerializer<StudioCommand> {
  @override
  final Iterable<Type> types = const [StudioCommand, _$StudioCommand];

  @override
  final String wireName = r'StudioCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StudioCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
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
  }

  @override
  Object serialize(
    Serializers serializers,
    StudioCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StudioCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StudioCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StudioCommandBuilder();
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

