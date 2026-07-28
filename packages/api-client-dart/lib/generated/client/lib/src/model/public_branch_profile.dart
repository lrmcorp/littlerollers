//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_branch_profile_opening_hours_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_branch_profile.g.dart';

/// PublicBranchProfile
///
/// Properties:
/// * [slug] 
/// * [area] 
/// * [city] 
/// * [address] 
/// * [latitude] 
/// * [longitude] 
/// * [openingHours] 
/// * [description] 
/// * [arrivalInformation] 
/// * [parkingInformation] 
/// * [amenities] 
/// * [heroImageKey] 
/// * [galleryImageKeys] 
@BuiltValue()
abstract class PublicBranchProfile implements Built<PublicBranchProfile, PublicBranchProfileBuilder> {
  @BuiltValueField(wireName: r'slug')
  String get slug;

  @BuiltValueField(wireName: r'area')
  String get area;

  @BuiltValueField(wireName: r'city')
  String get city;

  @BuiltValueField(wireName: r'address')
  String get address;

  @BuiltValueField(wireName: r'latitude')
  num? get latitude;

  @BuiltValueField(wireName: r'longitude')
  num? get longitude;

  @BuiltValueField(wireName: r'openingHours')
  BuiltList<PublicBranchProfileOpeningHoursInner> get openingHours;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'arrivalInformation')
  String? get arrivalInformation;

  @BuiltValueField(wireName: r'parkingInformation')
  String? get parkingInformation;

  @BuiltValueField(wireName: r'amenities')
  BuiltList<String> get amenities;

  @BuiltValueField(wireName: r'heroImageKey')
  String get heroImageKey;

  @BuiltValueField(wireName: r'galleryImageKeys')
  BuiltList<String> get galleryImageKeys;

  PublicBranchProfile._();

  factory PublicBranchProfile([void updates(PublicBranchProfileBuilder b)]) = _$PublicBranchProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicBranchProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicBranchProfile> get serializer => _$PublicBranchProfileSerializer();
}

class _$PublicBranchProfileSerializer implements PrimitiveSerializer<PublicBranchProfile> {
  @override
  final Iterable<Type> types = const [PublicBranchProfile, _$PublicBranchProfile];

  @override
  final String wireName = r'PublicBranchProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicBranchProfile object, {
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
    yield r'address';
    yield serializers.serialize(
      object.address,
      specifiedType: const FullType(String),
    );
    if (object.latitude != null) {
      yield r'latitude';
      yield serializers.serialize(
        object.latitude,
        specifiedType: const FullType.nullable(num),
      );
    }
    if (object.longitude != null) {
      yield r'longitude';
      yield serializers.serialize(
        object.longitude,
        specifiedType: const FullType.nullable(num),
      );
    }
    yield r'openingHours';
    yield serializers.serialize(
      object.openingHours,
      specifiedType: const FullType(BuiltList, [FullType(PublicBranchProfileOpeningHoursInner)]),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    if (object.arrivalInformation != null) {
      yield r'arrivalInformation';
      yield serializers.serialize(
        object.arrivalInformation,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.parkingInformation != null) {
      yield r'parkingInformation';
      yield serializers.serialize(
        object.parkingInformation,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'amenities';
    yield serializers.serialize(
      object.amenities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'heroImageKey';
    yield serializers.serialize(
      object.heroImageKey,
      specifiedType: const FullType(String),
    );
    yield r'galleryImageKeys';
    yield serializers.serialize(
      object.galleryImageKeys,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicBranchProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicBranchProfileBuilder result,
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
            specifiedType: const FullType(String),
          ) as String;
          result.address = valueDes;
          break;
        case r'latitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(num),
          ) as num?;
          if (valueDes == null) continue;
          result.latitude = valueDes;
          break;
        case r'longitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(num),
          ) as num?;
          if (valueDes == null) continue;
          result.longitude = valueDes;
          break;
        case r'openingHours':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicBranchProfileOpeningHoursInner)]),
          ) as BuiltList<PublicBranchProfileOpeningHoursInner>;
          result.openingHours.replace(valueDes);
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'arrivalInformation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.arrivalInformation = valueDes;
          break;
        case r'parkingInformation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.parkingInformation = valueDes;
          break;
        case r'amenities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.amenities.replace(valueDes);
          break;
        case r'heroImageKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.heroImageKey = valueDes;
          break;
        case r'galleryImageKeys':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.galleryImageKeys.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicBranchProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicBranchProfileBuilder();
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

