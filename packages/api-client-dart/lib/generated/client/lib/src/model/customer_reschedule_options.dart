//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_reschedule_slot.dart';
import 'package:openapi/src/model/customer_reschedule_target.dart';
import 'package:openapi/src/model/reschedule.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_reschedule_options.g.dart';

/// CustomerRescheduleOptions
///
/// Properties:
/// * [bookingId] 
/// * [bookingVersion] 
/// * [sourceClassSlotId] 
/// * [cutoffAt] 
/// * [canRequest] 
/// * [unavailableReason] 
/// * [supportAction] 
/// * [source_] 
/// * [latestRequest] 
/// * [targets] 
@BuiltValue()
abstract class CustomerRescheduleOptions implements Built<CustomerRescheduleOptions, CustomerRescheduleOptionsBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'bookingVersion')
  int get bookingVersion;

  @BuiltValueField(wireName: r'sourceClassSlotId')
  String get sourceClassSlotId;

  @BuiltValueField(wireName: r'cutoffAt')
  DateTime get cutoffAt;

  @BuiltValueField(wireName: r'canRequest')
  bool get canRequest;

  @BuiltValueField(wireName: r'unavailableReason')
  CustomerRescheduleOptionsUnavailableReasonEnum? get unavailableReason;
  // enum unavailableReasonEnum {  NO_ELIGIBLE_TARGET,  RESCHEDULE_PENDING,  BOOKING_NOT_ACTIVE,  RESCHEDULE_CUTOFF_PASSED,  PACKAGE_INELIGIBLE,  ,  };

  @BuiltValueField(wireName: r'supportAction')
  CustomerRescheduleOptionsSupportActionEnum? get supportAction;
  // enum supportActionEnum {  CONTACT_STUDIO,  ,  };

  @BuiltValueField(wireName: r'source')
  CustomerRescheduleSlot get source_;

  @BuiltValueField(wireName: r'latestRequest')
  Reschedule? get latestRequest;

  @BuiltValueField(wireName: r'targets')
  BuiltList<CustomerRescheduleTarget> get targets;

  CustomerRescheduleOptions._();

  factory CustomerRescheduleOptions([void updates(CustomerRescheduleOptionsBuilder b)]) = _$CustomerRescheduleOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerRescheduleOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerRescheduleOptions> get serializer => _$CustomerRescheduleOptionsSerializer();
}

class _$CustomerRescheduleOptionsSerializer implements PrimitiveSerializer<CustomerRescheduleOptions> {
  @override
  final Iterable<Type> types = const [CustomerRescheduleOptions, _$CustomerRescheduleOptions];

  @override
  final String wireName = r'CustomerRescheduleOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerRescheduleOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'bookingVersion';
    yield serializers.serialize(
      object.bookingVersion,
      specifiedType: const FullType(int),
    );
    yield r'sourceClassSlotId';
    yield serializers.serialize(
      object.sourceClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'cutoffAt';
    yield serializers.serialize(
      object.cutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'canRequest';
    yield serializers.serialize(
      object.canRequest,
      specifiedType: const FullType(bool),
    );
    yield r'unavailableReason';
    yield object.unavailableReason == null ? null : serializers.serialize(
      object.unavailableReason,
      specifiedType: const FullType.nullable(CustomerRescheduleOptionsUnavailableReasonEnum),
    );
    yield r'supportAction';
    yield object.supportAction == null ? null : serializers.serialize(
      object.supportAction,
      specifiedType: const FullType.nullable(CustomerRescheduleOptionsSupportActionEnum),
    );
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(CustomerRescheduleSlot),
    );
    yield r'latestRequest';
    yield object.latestRequest == null ? null : serializers.serialize(
      object.latestRequest,
      specifiedType: const FullType.nullable(Reschedule),
    );
    yield r'targets';
    yield serializers.serialize(
      object.targets,
      specifiedType: const FullType(BuiltList, [FullType(CustomerRescheduleTarget)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerRescheduleOptionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'bookingVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookingVersion = valueDes;
          break;
        case r'sourceClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceClassSlotId = valueDes;
          break;
        case r'cutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.cutoffAt = valueDes;
          break;
        case r'canRequest':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.canRequest = valueDes;
          break;
        case r'unavailableReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerRescheduleOptionsUnavailableReasonEnum),
          ) as CustomerRescheduleOptionsUnavailableReasonEnum?;
          if (valueDes == null) continue;
          result.unavailableReason = valueDes;
          break;
        case r'supportAction':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerRescheduleOptionsSupportActionEnum),
          ) as CustomerRescheduleOptionsSupportActionEnum?;
          if (valueDes == null) continue;
          result.supportAction = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerRescheduleSlot),
          ) as CustomerRescheduleSlot;
          result.source_ = valueDes;
          break;
        case r'latestRequest':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Reschedule),
          ) as Reschedule?;
          if (valueDes == null) continue;
          result.latestRequest.replace(valueDes);
          break;
        case r'targets':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerRescheduleTarget)]),
          ) as BuiltList<CustomerRescheduleTarget>;
          result.targets.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerRescheduleOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerRescheduleOptionsBuilder();
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

class CustomerRescheduleOptionsUnavailableReasonEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'NO_ELIGIBLE_TARGET')
  static const CustomerRescheduleOptionsUnavailableReasonEnum NO_ELIGIBLE_TARGET = _$customerRescheduleOptionsUnavailableReasonEnum_NO_ELIGIBLE_TARGET;
  @BuiltValueEnumConst(wireName: r'RESCHEDULE_PENDING')
  static const CustomerRescheduleOptionsUnavailableReasonEnum RESCHEDULE_PENDING = _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_PENDING;
  @BuiltValueEnumConst(wireName: r'BOOKING_NOT_ACTIVE')
  static const CustomerRescheduleOptionsUnavailableReasonEnum BOOKING_NOT_ACTIVE = _$customerRescheduleOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE;
  @BuiltValueEnumConst(wireName: r'RESCHEDULE_CUTOFF_PASSED')
  static const CustomerRescheduleOptionsUnavailableReasonEnum RESCHEDULE_CUTOFF_PASSED = _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_CUTOFF_PASSED;
  @BuiltValueEnumConst(wireName: r'PACKAGE_INELIGIBLE')
  static const CustomerRescheduleOptionsUnavailableReasonEnum PACKAGE_INELIGIBLE = _$customerRescheduleOptionsUnavailableReasonEnum_PACKAGE_INELIGIBLE;

  static Serializer<CustomerRescheduleOptionsUnavailableReasonEnum> get serializer => _$customerRescheduleOptionsUnavailableReasonEnumSerializer;

  const CustomerRescheduleOptionsUnavailableReasonEnum._(String name): super(name);

  static BuiltSet<CustomerRescheduleOptionsUnavailableReasonEnum> get values => _$customerRescheduleOptionsUnavailableReasonEnumValues;
  static CustomerRescheduleOptionsUnavailableReasonEnum valueOf(String name) => _$customerRescheduleOptionsUnavailableReasonEnumValueOf(name);
}

class CustomerRescheduleOptionsSupportActionEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CONTACT_STUDIO')
  static const CustomerRescheduleOptionsSupportActionEnum CONTACT_STUDIO = _$customerRescheduleOptionsSupportActionEnum_CONTACT_STUDIO;

  static Serializer<CustomerRescheduleOptionsSupportActionEnum> get serializer => _$customerRescheduleOptionsSupportActionEnumSerializer;

  const CustomerRescheduleOptionsSupportActionEnum._(String name): super(name);

  static BuiltSet<CustomerRescheduleOptionsSupportActionEnum> get values => _$customerRescheduleOptionsSupportActionEnumValues;
  static CustomerRescheduleOptionsSupportActionEnum valueOf(String name) => _$customerRescheduleOptionsSupportActionEnumValueOf(name);
}

