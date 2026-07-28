//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_package_profile.g.dart';

/// PublicPackageProfile
///
/// Properties:
/// * [summary] 
/// * [description] 
/// * [highlights] 
/// * [usageGuidance] 
/// * [terms] 
@BuiltValue()
abstract class PublicPackageProfile implements Built<PublicPackageProfile, PublicPackageProfileBuilder> {
  @BuiltValueField(wireName: r'summary')
  String get summary;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'highlights')
  BuiltList<String> get highlights;

  @BuiltValueField(wireName: r'usageGuidance')
  String get usageGuidance;

  @BuiltValueField(wireName: r'terms')
  BuiltList<String> get terms;

  PublicPackageProfile._();

  factory PublicPackageProfile([void updates(PublicPackageProfileBuilder b)]) = _$PublicPackageProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicPackageProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicPackageProfile> get serializer => _$PublicPackageProfileSerializer();
}

class _$PublicPackageProfileSerializer implements PrimitiveSerializer<PublicPackageProfile> {
  @override
  final Iterable<Type> types = const [PublicPackageProfile, _$PublicPackageProfile];

  @override
  final String wireName = r'PublicPackageProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicPackageProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    yield r'highlights';
    yield serializers.serialize(
      object.highlights,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'usageGuidance';
    yield serializers.serialize(
      object.usageGuidance,
      specifiedType: const FullType(String),
    );
    yield r'terms';
    yield serializers.serialize(
      object.terms,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicPackageProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicPackageProfileBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        case r'highlights':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.highlights.replace(valueDes);
          break;
        case r'usageGuidance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.usageGuidance = valueDes;
          break;
        case r'terms':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.terms.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicPackageProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicPackageProfileBuilder();
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

