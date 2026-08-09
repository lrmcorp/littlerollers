//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot.g.dart';

/// ClassSlot
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [classTypeId] 
/// * [studioId] 
/// * [roomId] 
/// * [instructorUserId] 
/// * [startAt] 
/// * [endAt] 
/// * [timezone] 
/// * [status] 
/// * [minimumQuota] 
/// * [capacity] 
/// * [bookedCount] 
/// * [cancellationReasonCode] 
/// * [version] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class ClassSlot implements Built<ClassSlot, ClassSlotBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'studioId')
  String get studioId;

  @BuiltValueField(wireName: r'roomId')
  String? get roomId;

  @BuiltValueField(wireName: r'instructorUserId')
  String? get instructorUserId;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'status')
  ClassSlotStatusEnum get status;
  // enum statusEnum {  DRAFT,  PUBLISHED,  CONFIRMED,  AUTO_CANCELLED,  CANCELLED,  COMPLETED,  };

  @BuiltValueField(wireName: r'minimumQuota')
  int get minimumQuota;

  @BuiltValueField(wireName: r'capacity')
  int get capacity;

  @BuiltValueField(wireName: r'bookedCount')
  int get bookedCount;

  @BuiltValueField(wireName: r'cancellationReasonCode')
  ClassSlotCancellationReasonCodeEnum? get cancellationReasonCode;
  // enum cancellationReasonCodeEnum {  STUDIO_UNAVAILABLE,  INSTRUCTOR_UNAVAILABLE,  SAFETY_ISSUE,  OTHER_REVIEW_REQUIRED,  ,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  ClassSlot._();

  factory ClassSlot([void updates(ClassSlotBuilder b)]) = _$ClassSlot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlot> get serializer => _$ClassSlotSerializer();
}

class _$ClassSlotSerializer implements PrimitiveSerializer<ClassSlot> {
  @override
  final Iterable<Type> types = const [ClassSlot, _$ClassSlot];

  @override
  final String wireName = r'ClassSlot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'studioId';
    yield serializers.serialize(
      object.studioId,
      specifiedType: const FullType(String),
    );
    if (object.roomId != null) {
      yield r'roomId';
      yield serializers.serialize(
        object.roomId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.instructorUserId != null) {
      yield r'instructorUserId';
      yield serializers.serialize(
        object.instructorUserId,
        specifiedType: const FullType.nullable(String),
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
      specifiedType: const FullType(ClassSlotStatusEnum),
    );
    yield r'minimumQuota';
    yield serializers.serialize(
      object.minimumQuota,
      specifiedType: const FullType(int),
    );
    yield r'capacity';
    yield serializers.serialize(
      object.capacity,
      specifiedType: const FullType(int),
    );
    yield r'bookedCount';
    yield serializers.serialize(
      object.bookedCount,
      specifiedType: const FullType(int),
    );
    if (object.cancellationReasonCode != null) {
      yield r'cancellationReasonCode';
      yield serializers.serialize(
        object.cancellationReasonCode,
        specifiedType: const FullType.nullable(ClassSlotCancellationReasonCodeEnum),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotBuilder result,
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
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'studioId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.studioId = valueDes;
          break;
        case r'roomId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.roomId = valueDes;
          break;
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.instructorUserId = valueDes;
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
            specifiedType: const FullType(ClassSlotStatusEnum),
          ) as ClassSlotStatusEnum;
          result.status = valueDes;
          break;
        case r'minimumQuota':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumQuota = valueDes;
          break;
        case r'capacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.capacity = valueDes;
          break;
        case r'bookedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookedCount = valueDes;
          break;
        case r'cancellationReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(ClassSlotCancellationReasonCodeEnum),
          ) as ClassSlotCancellationReasonCodeEnum?;
          if (valueDes == null) continue;
          result.cancellationReasonCode = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassSlot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotBuilder();
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

class ClassSlotStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const ClassSlotStatusEnum DRAFT = _$classSlotStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const ClassSlotStatusEnum PUBLISHED = _$classSlotStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const ClassSlotStatusEnum CONFIRMED = _$classSlotStatusEnum_CONFIRMED;
  @BuiltValueEnumConst(wireName: r'AUTO_CANCELLED')
  static const ClassSlotStatusEnum AUTO_CANCELLED = _$classSlotStatusEnum_AUTO_CANCELLED;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const ClassSlotStatusEnum CANCELLED = _$classSlotStatusEnum_CANCELLED;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const ClassSlotStatusEnum COMPLETED = _$classSlotStatusEnum_COMPLETED;

  static Serializer<ClassSlotStatusEnum> get serializer => _$classSlotStatusEnumSerializer;

  const ClassSlotStatusEnum._(String name): super(name);

  static BuiltSet<ClassSlotStatusEnum> get values => _$classSlotStatusEnumValues;
  static ClassSlotStatusEnum valueOf(String name) => _$classSlotStatusEnumValueOf(name);
}

class ClassSlotCancellationReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'STUDIO_UNAVAILABLE')
  static const ClassSlotCancellationReasonCodeEnum STUDIO_UNAVAILABLE = _$classSlotCancellationReasonCodeEnum_STUDIO_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_UNAVAILABLE')
  static const ClassSlotCancellationReasonCodeEnum INSTRUCTOR_UNAVAILABLE = _$classSlotCancellationReasonCodeEnum_INSTRUCTOR_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'SAFETY_ISSUE')
  static const ClassSlotCancellationReasonCodeEnum SAFETY_ISSUE = _$classSlotCancellationReasonCodeEnum_SAFETY_ISSUE;
  @BuiltValueEnumConst(wireName: r'OTHER_REVIEW_REQUIRED')
  static const ClassSlotCancellationReasonCodeEnum OTHER_REVIEW_REQUIRED = _$classSlotCancellationReasonCodeEnum_OTHER_REVIEW_REQUIRED;

  static Serializer<ClassSlotCancellationReasonCodeEnum> get serializer => _$classSlotCancellationReasonCodeEnumSerializer;

  const ClassSlotCancellationReasonCodeEnum._(String name): super(name);

  static BuiltSet<ClassSlotCancellationReasonCodeEnum> get values => _$classSlotCancellationReasonCodeEnumValues;
  static ClassSlotCancellationReasonCodeEnum valueOf(String name) => _$classSlotCancellationReasonCodeEnumValueOf(name);
}

