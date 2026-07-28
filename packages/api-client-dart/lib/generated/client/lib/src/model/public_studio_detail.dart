//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary.dart';
import 'package:openapi/src/model/public_branch.dart';
import 'package:openapi/src/model/public_branch_profile.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_package_summary.dart';
import 'package:openapi/src/model/public_studio_detail_all_of_classes.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_studio_detail.g.dart';

/// PublicStudioDetail
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [timezone] 
/// * [supportWhatsappE164] 
/// * [publicProfile] 
/// * [classes] 
/// * [packages] 
/// * [schedules] 
@BuiltValue()
abstract class PublicStudioDetail implements PublicBranch, Built<PublicStudioDetail, PublicStudioDetailBuilder> {
  @BuiltValueField(wireName: r'classes')
  BuiltList<PublicStudioDetailAllOfClasses> get classes;

  @BuiltValueField(wireName: r'schedules')
  BuiltList<PublicScheduleSummary> get schedules;

  @BuiltValueField(wireName: r'packages')
  BuiltList<PublicPackageSummary> get packages;

  PublicStudioDetail._();

  factory PublicStudioDetail([void updates(PublicStudioDetailBuilder b)]) = _$PublicStudioDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicStudioDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicStudioDetail> get serializer => _$PublicStudioDetailSerializer();
}

class _$PublicStudioDetailSerializer implements PrimitiveSerializer<PublicStudioDetail> {
  @override
  final Iterable<Type> types = const [PublicStudioDetail, _$PublicStudioDetail];

  @override
  final String wireName = r'PublicStudioDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicStudioDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.supportWhatsappE164 != null) {
      yield r'supportWhatsappE164';
      yield serializers.serialize(
        object.supportWhatsappE164,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    yield r'classes';
    yield serializers.serialize(
      object.classes,
      specifiedType: const FullType(BuiltList, [FullType(PublicStudioDetailAllOfClasses)]),
    );
    yield r'schedules';
    yield serializers.serialize(
      object.schedules,
      specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'publicProfile';
    yield serializers.serialize(
      object.publicProfile,
      specifiedType: const FullType(PublicBranchProfile),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'packages';
    yield serializers.serialize(
      object.packages,
      specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicStudioDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicStudioDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'classes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicStudioDetailAllOfClasses)]),
          ) as BuiltList<PublicStudioDetailAllOfClasses>;
          result.classes.replace(valueDes);
          break;
        case r'schedules':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
          ) as BuiltList<PublicScheduleSummary>;
          result.schedules.replace(valueDes);
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'publicProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranchProfile),
          ) as PublicBranchProfile;
          result.publicProfile.replace(valueDes);
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
          ) as BuiltList<PublicPackageSummary>;
          result.packages.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicStudioDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicStudioDetailBuilder();
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

