//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_class_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_class_marketing_summary.g.dart';

/// PublicClassMarketingSummary
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
/// * [name] 
@BuiltValue()
abstract class PublicClassMarketingSummary implements PublicClassProfile, Built<PublicClassMarketingSummary, PublicClassMarketingSummaryBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  PublicClassMarketingSummary._();

  factory PublicClassMarketingSummary([void updates(PublicClassMarketingSummaryBuilder b)]) = _$PublicClassMarketingSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicClassMarketingSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicClassMarketingSummary> get serializer => _$PublicClassMarketingSummarySerializer();
}

class _$PublicClassMarketingSummarySerializer implements PrimitiveSerializer<PublicClassMarketingSummary> {
  @override
  final Iterable<Type> types = const [PublicClassMarketingSummary, _$PublicClassMarketingSummary];

  @override
  final String wireName = r'PublicClassMarketingSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicClassMarketingSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(String),
    );
    yield r'benefits';
    yield serializers.serialize(
      object.benefits,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'durationMinutes';
    yield serializers.serialize(
      object.durationMinutes,
      specifiedType: const FullType(int),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'level';
    yield serializers.serialize(
      object.level,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'equipment';
    yield serializers.serialize(
      object.equipment,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'heroImageKey';
    yield serializers.serialize(
      object.heroImageKey,
      specifiedType: const FullType(String),
    );
    yield r'slug';
    yield serializers.serialize(
      object.slug,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicClassMarketingSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicClassMarketingSummaryBuilder result,
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
        case r'benefits':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.benefits.replace(valueDes);
          break;
        case r'durationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationMinutes = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'level':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.level = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'equipment':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.equipment.replace(valueDes);
          break;
        case r'heroImageKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.heroImageKey = valueDes;
          break;
        case r'slug':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.slug = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicClassMarketingSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicClassMarketingSummaryBuilder();
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

