//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/session_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'preferred_studio.g.dart';

/// PreferredStudio
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [timezone] 
/// * [supportWhatsappE164] 
@BuiltValue()
abstract class PreferredStudio implements SessionBranch, Built<PreferredStudio, PreferredStudioBuilder> {
  @BuiltValueField(wireName: r'supportWhatsappE164')
  String? get supportWhatsappE164;

  PreferredStudio._();

  factory PreferredStudio([void updates(PreferredStudioBuilder b)]) = _$PreferredStudio;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PreferredStudioBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PreferredStudio> get serializer => _$PreferredStudioSerializer();
}

class _$PreferredStudioSerializer implements PrimitiveSerializer<PreferredStudio> {
  @override
  final Iterable<Type> types = const [PreferredStudio, _$PreferredStudio];

  @override
  final String wireName = r'PreferredStudio';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PreferredStudio object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'supportWhatsappE164';
    yield object.supportWhatsappE164 == null ? null : serializers.serialize(
      object.supportWhatsappE164,
      specifiedType: const FullType.nullable(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PreferredStudio object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PreferredStudioBuilder result,
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
        case r'supportWhatsappE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.supportWhatsappE164 = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PreferredStudio deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PreferredStudioBuilder();
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

