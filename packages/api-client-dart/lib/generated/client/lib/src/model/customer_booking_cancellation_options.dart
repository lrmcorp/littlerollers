//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_cancellation_options.g.dart';

/// CustomerBookingCancellationOptions
///
/// Properties:
/// * [bookingId] 
/// * [bookingVersion] 
/// * [cutoffAt] 
/// * [canCancel] 
/// * [unavailableReason] 
/// * [supportAction] 
@BuiltValue()
abstract class CustomerBookingCancellationOptions implements Built<CustomerBookingCancellationOptions, CustomerBookingCancellationOptionsBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'bookingVersion')
  int get bookingVersion;

  @BuiltValueField(wireName: r'cutoffAt')
  DateTime get cutoffAt;

  @BuiltValueField(wireName: r'canCancel')
  bool get canCancel;

  @BuiltValueField(wireName: r'unavailableReason')
  CustomerBookingCancellationOptionsUnavailableReasonEnum? get unavailableReason;
  // enum unavailableReasonEnum {  BOOKING_NOT_ACTIVE,  CANCELLATION_CUTOFF_PASSED,  RESCHEDULE_PENDING,  ATTENDANCE_RECORDED,  RESERVATION_NOT_ACTIVE,  CLASS_SLOT_UNAVAILABLE,  ,  };

  @BuiltValueField(wireName: r'supportAction')
  CustomerBookingCancellationOptionsSupportActionEnum? get supportAction;
  // enum supportActionEnum {  CONTACT_STUDIO,  ,  };

  CustomerBookingCancellationOptions._();

  factory CustomerBookingCancellationOptions([void updates(CustomerBookingCancellationOptionsBuilder b)]) = _$CustomerBookingCancellationOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingCancellationOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingCancellationOptions> get serializer => _$CustomerBookingCancellationOptionsSerializer();
}

class _$CustomerBookingCancellationOptionsSerializer implements PrimitiveSerializer<CustomerBookingCancellationOptions> {
  @override
  final Iterable<Type> types = const [CustomerBookingCancellationOptions, _$CustomerBookingCancellationOptions];

  @override
  final String wireName = r'CustomerBookingCancellationOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingCancellationOptions object, {
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
    yield r'cutoffAt';
    yield serializers.serialize(
      object.cutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'canCancel';
    yield serializers.serialize(
      object.canCancel,
      specifiedType: const FullType(bool),
    );
    yield r'unavailableReason';
    yield object.unavailableReason == null ? null : serializers.serialize(
      object.unavailableReason,
      specifiedType: const FullType.nullable(CustomerBookingCancellationOptionsUnavailableReasonEnum),
    );
    yield r'supportAction';
    yield object.supportAction == null ? null : serializers.serialize(
      object.supportAction,
      specifiedType: const FullType.nullable(CustomerBookingCancellationOptionsSupportActionEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingCancellationOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingCancellationOptionsBuilder result,
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
        case r'cutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.cutoffAt = valueDes;
          break;
        case r'canCancel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.canCancel = valueDes;
          break;
        case r'unavailableReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerBookingCancellationOptionsUnavailableReasonEnum),
          ) as CustomerBookingCancellationOptionsUnavailableReasonEnum?;
          if (valueDes == null) continue;
          result.unavailableReason = valueDes;
          break;
        case r'supportAction':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerBookingCancellationOptionsSupportActionEnum),
          ) as CustomerBookingCancellationOptionsSupportActionEnum?;
          if (valueDes == null) continue;
          result.supportAction = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerBookingCancellationOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingCancellationOptionsBuilder();
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

class CustomerBookingCancellationOptionsUnavailableReasonEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BOOKING_NOT_ACTIVE')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum BOOKING_NOT_ACTIVE = _$customerBookingCancellationOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE;
  @BuiltValueEnumConst(wireName: r'CANCELLATION_CUTOFF_PASSED')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum CANCELLATION_CUTOFF_PASSED = _$customerBookingCancellationOptionsUnavailableReasonEnum_CANCELLATION_CUTOFF_PASSED;
  @BuiltValueEnumConst(wireName: r'RESCHEDULE_PENDING')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum RESCHEDULE_PENDING = _$customerBookingCancellationOptionsUnavailableReasonEnum_RESCHEDULE_PENDING;
  @BuiltValueEnumConst(wireName: r'ATTENDANCE_RECORDED')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum ATTENDANCE_RECORDED = _$customerBookingCancellationOptionsUnavailableReasonEnum_ATTENDANCE_RECORDED;
  @BuiltValueEnumConst(wireName: r'RESERVATION_NOT_ACTIVE')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum RESERVATION_NOT_ACTIVE = _$customerBookingCancellationOptionsUnavailableReasonEnum_RESERVATION_NOT_ACTIVE;
  @BuiltValueEnumConst(wireName: r'CLASS_SLOT_UNAVAILABLE')
  static const CustomerBookingCancellationOptionsUnavailableReasonEnum CLASS_SLOT_UNAVAILABLE = _$customerBookingCancellationOptionsUnavailableReasonEnum_CLASS_SLOT_UNAVAILABLE;

  static Serializer<CustomerBookingCancellationOptionsUnavailableReasonEnum> get serializer => _$customerBookingCancellationOptionsUnavailableReasonEnumSerializer;

  const CustomerBookingCancellationOptionsUnavailableReasonEnum._(String name): super(name);

  static BuiltSet<CustomerBookingCancellationOptionsUnavailableReasonEnum> get values => _$customerBookingCancellationOptionsUnavailableReasonEnumValues;
  static CustomerBookingCancellationOptionsUnavailableReasonEnum valueOf(String name) => _$customerBookingCancellationOptionsUnavailableReasonEnumValueOf(name);
}

class CustomerBookingCancellationOptionsSupportActionEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CONTACT_STUDIO')
  static const CustomerBookingCancellationOptionsSupportActionEnum CONTACT_STUDIO = _$customerBookingCancellationOptionsSupportActionEnum_CONTACT_STUDIO;

  static Serializer<CustomerBookingCancellationOptionsSupportActionEnum> get serializer => _$customerBookingCancellationOptionsSupportActionEnumSerializer;

  const CustomerBookingCancellationOptionsSupportActionEnum._(String name): super(name);

  static BuiltSet<CustomerBookingCancellationOptionsSupportActionEnum> get values => _$customerBookingCancellationOptionsSupportActionEnumValues;
  static CustomerBookingCancellationOptionsSupportActionEnum valueOf(String name) => _$customerBookingCancellationOptionsSupportActionEnumValueOf(name);
}

