//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_class_profile.g.dart';

/// PublicClassProfile
///
/// Properties:
/// * [code] 
/// * [slug] 
/// * [summary] 
/// * [description] 
/// * [level] 
/// * [durationMinutes] 
/// * [equipment] 
/// * [benefits] 
/// * [heroImageKey] 
@BuiltValue(instantiable: false)
abstract class PublicClassProfile  {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'slug')
  String get slug;

  @BuiltValueField(wireName: r'summary')
  String get summary;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'level')
  String get level;

  @BuiltValueField(wireName: r'durationMinutes')
  int get durationMinutes;

  @BuiltValueField(wireName: r'equipment')
  BuiltList<String> get equipment;

  @BuiltValueField(wireName: r'benefits')
  BuiltList<String> get benefits;

  @BuiltValueField(wireName: r'heroImageKey')
  String get heroImageKey;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicClassProfile> get serializer => _$PublicClassProfileSerializer();
}

class _$PublicClassProfileSerializer implements PrimitiveSerializer<PublicClassProfile> {
  @override
  final Iterable<Type> types = const [PublicClassProfile];

  @override
  final String wireName = r'PublicClassProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicClassProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'slug';
    yield serializers.serialize(
      object.slug,
      specifiedType: const FullType(String),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'level';
    yield serializers.serialize(
      object.level,
      specifiedType: const FullType(String),
    );
    yield r'durationMinutes';
    yield serializers.serialize(
      object.durationMinutes,
      specifiedType: const FullType(int),
    );
    yield r'equipment';
    yield serializers.serialize(
      object.equipment,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'benefits';
    yield serializers.serialize(
      object.benefits,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'heroImageKey';
    yield serializers.serialize(
      object.heroImageKey,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicClassProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PublicClassProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PublicClassProfile)) as $PublicClassProfile;
  }
}

/// a concrete implementation of [PublicClassProfile], since [PublicClassProfile] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PublicClassProfile implements PublicClassProfile, Built<$PublicClassProfile, $PublicClassProfileBuilder> {
  $PublicClassProfile._();

  factory $PublicClassProfile([void Function($PublicClassProfileBuilder)? updates]) = _$$PublicClassProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PublicClassProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PublicClassProfile> get serializer => _$$PublicClassProfileSerializer();
}

class _$$PublicClassProfileSerializer implements PrimitiveSerializer<$PublicClassProfile> {
  @override
  final Iterable<Type> types = const [$PublicClassProfile, _$$PublicClassProfile];

  @override
  final String wireName = r'$PublicClassProfile';

  @override
  Object serialize(
    Serializers serializers,
    $PublicClassProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PublicClassProfile))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicClassProfileBuilder result,
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
        case r'slug':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.slug = valueDes;
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.summary = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'level':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.level = valueDes;
          break;
        case r'durationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationMinutes = valueDes;
          break;
        case r'equipment':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.equipment.replace(valueDes);
          break;
        case r'benefits':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.benefits.replace(valueDes);
          break;
        case r'heroImageKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.heroImageKey = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PublicClassProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PublicClassProfileBuilder();
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

