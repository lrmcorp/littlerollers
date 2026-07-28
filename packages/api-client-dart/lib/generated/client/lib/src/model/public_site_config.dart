//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_class_marketing_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_site_config.g.dart';

/// PublicSiteConfig
///
/// Properties:
/// * [branches] 
/// * [classes] 
/// * [fallbackWhatsappE164] 
@BuiltValue()
abstract class PublicSiteConfig implements Built<PublicSiteConfig, PublicSiteConfigBuilder> {
  @BuiltValueField(wireName: r'branches')
  BuiltList<PublicBranch> get branches;

  @BuiltValueField(wireName: r'classes')
  BuiltList<PublicClassMarketingSummary> get classes;

  @BuiltValueField(wireName: r'fallbackWhatsappE164')
  String? get fallbackWhatsappE164;

  PublicSiteConfig._();

  factory PublicSiteConfig([void updates(PublicSiteConfigBuilder b)]) = _$PublicSiteConfig;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicSiteConfigBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicSiteConfig> get serializer => _$PublicSiteConfigSerializer();
}

class _$PublicSiteConfigSerializer implements PrimitiveSerializer<PublicSiteConfig> {
  @override
  final Iterable<Type> types = const [PublicSiteConfig, _$PublicSiteConfig];

  @override
  final String wireName = r'PublicSiteConfig';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicSiteConfig object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
    );
    yield r'classes';
    yield serializers.serialize(
      object.classes,
      specifiedType: const FullType(BuiltList, [FullType(PublicClassMarketingSummary)]),
    );
    yield r'fallbackWhatsappE164';
    yield object.fallbackWhatsappE164 == null ? null : serializers.serialize(
      object.fallbackWhatsappE164,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicSiteConfig object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicSiteConfigBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
          ) as BuiltList<PublicBranch>;
          result.branches.replace(valueDes);
          break;
        case r'classes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicClassMarketingSummary)]),
          ) as BuiltList<PublicClassMarketingSummary>;
          result.classes.replace(valueDes);
          break;
        case r'fallbackWhatsappE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.fallbackWhatsappE164 = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicSiteConfig deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicSiteConfigBuilder();
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

