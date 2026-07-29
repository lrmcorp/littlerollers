//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_public_profile_summary.g.dart';

/// BranchPublicProfileSummary
///
/// Properties:
/// * [slug] 
/// * [area] 
/// * [city] 
/// * [address] 
@BuiltValue()
abstract class BranchPublicProfileSummary implements Built<BranchPublicProfileSummary, BranchPublicProfileSummaryBuilder> {
  @BuiltValueField(wireName: r'slug')
  String get slug;

  @BuiltValueField(wireName: r'area')
  String get area;

  @BuiltValueField(wireName: r'city')
  String get city;

  @BuiltValueField(wireName: r'address')
  String? get address;

  BranchPublicProfileSummary._();

  factory BranchPublicProfileSummary([void updates(BranchPublicProfileSummaryBuilder b)]) = _$BranchPublicProfileSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchPublicProfileSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchPublicProfileSummary> get serializer => _$BranchPublicProfileSummarySerializer();
}

class _$BranchPublicProfileSummarySerializer implements PrimitiveSerializer<BranchPublicProfileSummary> {
  @override
  final Iterable<Type> types = const [BranchPublicProfileSummary, _$BranchPublicProfileSummary];

  @override
  final String wireName = r'BranchPublicProfileSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchPublicProfileSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'slug';
    yield serializers.serialize(
      object.slug,
      specifiedType: const FullType(String),
    );
    yield r'area';
    yield serializers.serialize(
      object.area,
      specifiedType: const FullType(String),
    );
    yield r'city';
    yield serializers.serialize(
      object.city,
      specifiedType: const FullType(String),
    );
    if (object.address != null) {
      yield r'address';
      yield serializers.serialize(
        object.address,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BranchPublicProfileSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchPublicProfileSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'slug':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.slug = valueDes;
          break;
        case r'area':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.area = valueDes;
          break;
        case r'city':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.city = valueDes;
          break;
        case r'address':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.address = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BranchPublicProfileSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchPublicProfileSummaryBuilder();
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

