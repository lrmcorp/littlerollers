//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule.g.dart';

/// Reschedule
///
/// Properties:
/// * [id] 
/// * [bookingId] 
/// * [sourceClassSlotId] 
/// * [targetClassSlotId] 
/// * [status] 
/// * [requestedAt] 
/// * [decidedAt] 
/// * [version] 
@BuiltValue()
abstract class Reschedule implements Built<Reschedule, RescheduleBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'sourceClassSlotId')
  String get sourceClassSlotId;

  @BuiltValueField(wireName: r'targetClassSlotId')
  String get targetClassSlotId;

  @BuiltValueField(wireName: r'status')
  RescheduleStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  REJECTED,  };

  @BuiltValueField(wireName: r'requestedAt')
  DateTime get requestedAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  Reschedule._();

  factory Reschedule([void updates(RescheduleBuilder b)]) = _$Reschedule;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Reschedule> get serializer => _$RescheduleSerializer();
}

class _$RescheduleSerializer implements PrimitiveSerializer<Reschedule> {
  @override
  final Iterable<Type> types = const [Reschedule, _$Reschedule];

  @override
  final String wireName = r'Reschedule';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Reschedule object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'sourceClassSlotId';
    yield serializers.serialize(
      object.sourceClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'targetClassSlotId';
    yield serializers.serialize(
      object.targetClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(RescheduleStatusEnum),
    );
    yield r'requestedAt';
    yield serializers.serialize(
      object.requestedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Reschedule object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleBuilder result,
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
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'sourceClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceClassSlotId = valueDes;
          break;
        case r'targetClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.targetClassSlotId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleStatusEnum),
          ) as RescheduleStatusEnum;
          result.status = valueDes;
          break;
        case r'requestedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.requestedAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Reschedule deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleBuilder();
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

class RescheduleStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const RescheduleStatusEnum PENDING = _$rescheduleStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const RescheduleStatusEnum APPROVED = _$rescheduleStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const RescheduleStatusEnum REJECTED = _$rescheduleStatusEnum_REJECTED;

  static Serializer<RescheduleStatusEnum> get serializer => _$rescheduleStatusEnumSerializer;

  const RescheduleStatusEnum._(String name): super(name);

  static BuiltSet<RescheduleStatusEnum> get values => _$rescheduleStatusEnumValues;
  static RescheduleStatusEnum valueOf(String name) => _$rescheduleStatusEnumValueOf(name);
}

