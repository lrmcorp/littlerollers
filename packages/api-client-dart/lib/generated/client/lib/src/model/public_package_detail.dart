//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary.dart';
import 'package:openapi/src/model/public_branch.dart';
import 'package:openapi/src/model/public_package_profile.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_package_summary.dart';
import 'package:openapi/src/model/session_duration_minutes.dart';
import 'package:openapi/src/model/public_package_promotion.dart';
import 'package:openapi/src/model/public_class_type_ref.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_package_detail.g.dart';

/// PublicPackageDetail
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [name] 
/// * [sessionCount] 
/// * [sessionDurationMinutes] 
/// * [durationDays] 
/// * [priceRp] 
/// * [effectivePriceRp] 
/// * [promotion] 
/// * [effectiveUntil] 
/// * [classType] 
/// * [publicProfile] 
/// * [branch] 
/// * [pricePerSessionRp] 
/// * [effectiveFrom] 
/// * [schedules] 
@BuiltValue()
abstract class PublicPackageDetail implements PublicPackageSummary, Built<PublicPackageDetail, PublicPackageDetailBuilder> {
  @BuiltValueField(wireName: r'schedules')
  BuiltList<PublicScheduleSummary> get schedules;

  @BuiltValueField(wireName: r'pricePerSessionRp')
  int get pricePerSessionRp;

  @BuiltValueField(wireName: r'effectiveFrom')
  DateTime get effectiveFrom;

  PublicPackageDetail._();

  factory PublicPackageDetail([void updates(PublicPackageDetailBuilder b)]) = _$PublicPackageDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicPackageDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicPackageDetail> get serializer => _$PublicPackageDetailSerializer();
}

class _$PublicPackageDetailSerializer implements PrimitiveSerializer<PublicPackageDetail> {
  @override
  final Iterable<Type> types = const [PublicPackageDetail, _$PublicPackageDetail];

  @override
  final String wireName = r'PublicPackageDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(PublicBranch),
      );
    }
    yield r'effectivePriceRp';
    yield serializers.serialize(
      object.effectivePriceRp,
      specifiedType: const FullType(int),
    );
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    if (object.sessionDurationMinutes != null) {
      yield r'sessionDurationMinutes';
      yield serializers.serialize(
        object.sessionDurationMinutes,
        specifiedType: const FullType(SessionDurationMinutes),
      );
    }
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
    if (object.publicProfile != null) {
      yield r'publicProfile';
      yield serializers.serialize(
        object.publicProfile,
        specifiedType: const FullType(PublicPackageProfile),
      );
    }
    yield r'pricePerSessionRp';
    yield serializers.serialize(
      object.pricePerSessionRp,
      specifiedType: const FullType(int),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(DateTime),
    );
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(PublicClassTypeRef),
      );
    }
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'promotion';
    yield object.promotion == null ? null : serializers.serialize(
      object.promotion,
      specifiedType: const FullType.nullable(PublicPackagePromotion),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicPackageDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranch),
          ) as PublicBranch;
          result.branch = valueDes;
          break;
        case r'effectivePriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.effectivePriceRp = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'sessionDurationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionDurationMinutes),
          ) as SessionDurationMinutes;
          result.sessionDurationMinutes = valueDes;
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
            specifiedType: const FullType(PublicPackageProfile),
          ) as PublicPackageProfile;
          result.publicProfile.replace(valueDes);
          break;
        case r'pricePerSessionRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pricePerSessionRp = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.effectiveFrom = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassTypeRef),
          ) as PublicClassTypeRef;
          result.classType.replace(valueDes);
          break;
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'promotion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PublicPackagePromotion),
          ) as PublicPackagePromotion?;
          if (valueDes == null) continue;
          result.promotion.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicPackageDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicPackageDetailBuilder();
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

