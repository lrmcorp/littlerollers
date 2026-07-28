//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary.dart';
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_package_summary.dart';
import 'package:openapi/src/model/public_class_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_class_detail.g.dart';

/// PublicClassDetail
///
/// Properties:
/// * [profile] 
/// * [studios] 
/// * [packages] 
/// * [schedules] 
@BuiltValue()
abstract class PublicClassDetail implements Built<PublicClassDetail, PublicClassDetailBuilder> {
  @BuiltValueField(wireName: r'profile')
  PublicClassProfile get profile;

  @BuiltValueField(wireName: r'studios')
  BuiltList<PublicBranch> get studios;

  @BuiltValueField(wireName: r'packages')
  BuiltList<PublicPackageSummary> get packages;

  @BuiltValueField(wireName: r'schedules')
  BuiltList<PublicScheduleSummary> get schedules;

  PublicClassDetail._();

  factory PublicClassDetail([void updates(PublicClassDetailBuilder b)]) = _$PublicClassDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicClassDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicClassDetail> get serializer => _$PublicClassDetailSerializer();
}

class _$PublicClassDetailSerializer implements PrimitiveSerializer<PublicClassDetail> {
  @override
  final Iterable<Type> types = const [PublicClassDetail, _$PublicClassDetail];

  @override
  final String wireName = r'PublicClassDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicClassDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'profile';
    yield serializers.serialize(
      object.profile,
      specifiedType: const FullType(PublicClassProfile),
    );
    yield r'studios';
    yield serializers.serialize(
      object.studios,
      specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
    );
    yield r'packages';
    yield serializers.serialize(
      object.packages,
      specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
    );
    yield r'schedules';
    yield serializers.serialize(
      object.schedules,
      specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicClassDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicClassDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'profile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassProfile),
          ) as PublicClassProfile;
          result.profile = valueDes;
          break;
        case r'studios':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
          ) as BuiltList<PublicBranch>;
          result.studios.replace(valueDes);
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
          ) as BuiltList<PublicPackageSummary>;
          result.packages.replace(valueDes);
          break;
        case r'schedules':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
          ) as BuiltList<PublicScheduleSummary>;
          result.schedules.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicClassDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicClassDetailBuilder();
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

