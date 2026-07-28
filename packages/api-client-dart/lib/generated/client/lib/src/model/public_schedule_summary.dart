//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_class_type_ref.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_schedule_summary.g.dart';

/// PublicScheduleSummary
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
@BuiltValue(instantiable: false)
abstract class PublicScheduleSummary  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'status')
  PublicScheduleSummaryStatusEnum get status;
  // enum statusEnum {  PUBLISHED,  CONFIRMED,  };

  @BuiltValueField(wireName: r'capacity')
  int get capacity;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'branch')
  PublicBranch? get branch;

  @BuiltValueField(wireName: r'classType')
  PublicClassTypeRef? get classType;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicScheduleSummary> get serializer => _$PublicScheduleSummarySerializer();
}

class _$PublicScheduleSummarySerializer implements PrimitiveSerializer<PublicScheduleSummary> {
  @override
  final Iterable<Type> types = const [PublicScheduleSummary];

  @override
  final String wireName = r'PublicScheduleSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicScheduleSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
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
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(PublicBranch),
      );
    }
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(PublicClassTypeRef),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicScheduleSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PublicScheduleSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PublicScheduleSummary)) as $PublicScheduleSummary;
  }
}

/// a concrete implementation of [PublicScheduleSummary], since [PublicScheduleSummary] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PublicScheduleSummary implements PublicScheduleSummary, Built<$PublicScheduleSummary, $PublicScheduleSummaryBuilder> {
  $PublicScheduleSummary._();

  factory $PublicScheduleSummary([void Function($PublicScheduleSummaryBuilder)? updates]) = _$$PublicScheduleSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PublicScheduleSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PublicScheduleSummary> get serializer => _$$PublicScheduleSummarySerializer();
}

class _$$PublicScheduleSummarySerializer implements PrimitiveSerializer<$PublicScheduleSummary> {
  @override
  final Iterable<Type> types = const [$PublicScheduleSummary, _$$PublicScheduleSummary];

  @override
  final String wireName = r'$PublicScheduleSummary';

  @override
  Object serialize(
    Serializers serializers,
    $PublicScheduleSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PublicScheduleSummary))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicScheduleSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
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
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranch),
          ) as PublicBranch;
          result.branch = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassTypeRef),
          ) as PublicClassTypeRef;
          result.classType.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PublicScheduleSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PublicScheduleSummaryBuilder();
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

class PublicScheduleSummaryStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const PublicScheduleSummaryStatusEnum PUBLISHED = _$publicScheduleSummaryStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const PublicScheduleSummaryStatusEnum CONFIRMED = _$publicScheduleSummaryStatusEnum_CONFIRMED;

  static Serializer<PublicScheduleSummaryStatusEnum> get serializer => _$publicScheduleSummaryStatusEnumSerializer;

  const PublicScheduleSummaryStatusEnum._(String name): super(name);

  static BuiltSet<PublicScheduleSummaryStatusEnum> get values => _$publicScheduleSummaryStatusEnumValues;
  static PublicScheduleSummaryStatusEnum valueOf(String name) => _$publicScheduleSummaryStatusEnumValueOf(name);
}

