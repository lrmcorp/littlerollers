//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary.dart';
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_class_type_ref.dart';
import 'package:openapi/src/model/public_class_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_schedule_detail.g.dart';

/// PublicScheduleDetail
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [startAt] 
/// * [endAt] 
/// * [timezone] 
/// * [status] 
/// * [capacity] 
/// * [available] 
/// * [branch] 
/// * [classType] 
/// * [classProfile] 
@BuiltValue()
abstract class PublicScheduleDetail implements PublicScheduleSummary, Built<PublicScheduleDetail, PublicScheduleDetailBuilder> {
  @BuiltValueField(wireName: r'classProfile')
  PublicClassProfile get classProfile;

  PublicScheduleDetail._();

  factory PublicScheduleDetail([void updates(PublicScheduleDetailBuilder b)]) = _$PublicScheduleDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicScheduleDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicScheduleDetail> get serializer => _$PublicScheduleDetailSerializer();
}

class _$PublicScheduleDetailSerializer implements PrimitiveSerializer<PublicScheduleDetail> {
  @override
  final Iterable<Type> types = const [PublicScheduleDetail, _$PublicScheduleDetail];

  @override
  final String wireName = r'PublicScheduleDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicScheduleDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(PublicBranch),
      );
    }
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(PublicClassTypeRef),
      );
    }
    yield r'classProfile';
    yield serializers.serialize(
      object.classProfile,
      specifiedType: const FullType(PublicClassProfile),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PublicScheduleSummaryStatusEnum),
    );
    yield r'capacity';
    yield serializers.serialize(
      object.capacity,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicScheduleDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicScheduleDetailBuilder result,
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
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranch),
          ) as PublicBranch;
          result.branch = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassTypeRef),
          ) as PublicClassTypeRef;
          result.classType.replace(valueDes);
          break;
        case r'classProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassProfile),
          ) as PublicClassProfile;
          result.classProfile = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicScheduleSummaryStatusEnum),
          ) as PublicScheduleSummaryStatusEnum;
          result.status = valueDes;
          break;
        case r'capacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.capacity = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicScheduleDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicScheduleDetailBuilder();
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

class PublicScheduleDetailStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const PublicScheduleDetailStatusEnum PUBLISHED = _$publicScheduleDetailStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const PublicScheduleDetailStatusEnum CONFIRMED = _$publicScheduleDetailStatusEnum_CONFIRMED;

  static Serializer<PublicScheduleDetailStatusEnum> get serializer => _$publicScheduleDetailStatusEnumSerializer;

  const PublicScheduleDetailStatusEnum._(String name): super(name);

  static BuiltSet<PublicScheduleDetailStatusEnum> get values => _$publicScheduleDetailStatusEnumValues;
  static PublicScheduleDetailStatusEnum valueOf(String name) => _$publicScheduleDetailStatusEnumValueOf(name);
}

