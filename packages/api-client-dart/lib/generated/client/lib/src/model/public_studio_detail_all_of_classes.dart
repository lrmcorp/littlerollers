//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_class_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_studio_detail_all_of_classes.g.dart';

/// PublicStudioDetailAllOfClasses
///
/// Properties:
/// * [code] 
/// * [name] 
/// * [profile] 
@BuiltValue()
abstract class PublicStudioDetailAllOfClasses implements Built<PublicStudioDetailAllOfClasses, PublicStudioDetailAllOfClassesBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'profile')
  PublicClassProfile get profile;

  PublicStudioDetailAllOfClasses._();

  factory PublicStudioDetailAllOfClasses([void updates(PublicStudioDetailAllOfClassesBuilder b)]) = _$PublicStudioDetailAllOfClasses;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicStudioDetailAllOfClassesBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicStudioDetailAllOfClasses> get serializer => _$PublicStudioDetailAllOfClassesSerializer();
}

class _$PublicStudioDetailAllOfClassesSerializer implements PrimitiveSerializer<PublicStudioDetailAllOfClasses> {
  @override
  final Iterable<Type> types = const [PublicStudioDetailAllOfClasses, _$PublicStudioDetailAllOfClasses];

  @override
  final String wireName = r'PublicStudioDetailAllOfClasses';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicStudioDetailAllOfClasses object, {
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
    yield r'profile';
    yield serializers.serialize(
      object.profile,
      specifiedType: const FullType(PublicClassProfile),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicStudioDetailAllOfClasses object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicStudioDetailAllOfClassesBuilder result,
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
        case r'profile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassProfile),
          ) as PublicClassProfile;
          result.profile = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicStudioDetailAllOfClasses deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicStudioDetailAllOfClassesBuilder();
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

