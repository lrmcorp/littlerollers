//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_eligibility.g.dart';

/// CustomerBookingEligibility
///
/// Properties:
/// * [canBook] 
/// * [reasonCode] 
/// * [requiredAction] 
/// * [cutoffAt] 
@BuiltValue()
abstract class CustomerBookingEligibility implements Built<CustomerBookingEligibility, CustomerBookingEligibilityBuilder> {
  @BuiltValueField(wireName: r'canBook')
  bool get canBook;

  @BuiltValueField(wireName: r'reasonCode')
  CustomerBookingEligibilityReasonCodeEnum? get reasonCode;
  // enum reasonCodeEnum {  IDENTITY_VERIFICATION_REQUIRED,  MATCHING_PACKAGE_REQUIRED,  INSUFFICIENT_AVAILABLE_SESSION,  SLOT_FULL,  SLOT_UNAVAILABLE,  BOOKING_CUTOFF_PASSED,  ,  };

  @BuiltValueField(wireName: r'requiredAction')
  CustomerBookingEligibilityRequiredActionEnum? get requiredAction;
  // enum requiredActionEnum {  COMPLETE_IDENTITY_VERIFICATION,  BUY_MATCHING_PACKAGE,  CONTACT_STUDIO,  ,  };

  @BuiltValueField(wireName: r'cutoffAt')
  DateTime get cutoffAt;

  CustomerBookingEligibility._();

  factory CustomerBookingEligibility([void updates(CustomerBookingEligibilityBuilder b)]) = _$CustomerBookingEligibility;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingEligibilityBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingEligibility> get serializer => _$CustomerBookingEligibilitySerializer();
}

class _$CustomerBookingEligibilitySerializer implements PrimitiveSerializer<CustomerBookingEligibility> {
  @override
  final Iterable<Type> types = const [CustomerBookingEligibility, _$CustomerBookingEligibility];

  @override
  final String wireName = r'CustomerBookingEligibility';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingEligibility object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'canBook';
    yield serializers.serialize(
      object.canBook,
      specifiedType: const FullType(bool),
    );
    yield r'reasonCode';
    yield object.reasonCode == null ? null : serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType.nullable(CustomerBookingEligibilityReasonCodeEnum),
    );
    yield r'requiredAction';
    yield object.requiredAction == null ? null : serializers.serialize(
      object.requiredAction,
      specifiedType: const FullType.nullable(CustomerBookingEligibilityRequiredActionEnum),
    );
    yield r'cutoffAt';
    yield serializers.serialize(
      object.cutoffAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingEligibility object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingEligibilityBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'canBook':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.canBook = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerBookingEligibilityReasonCodeEnum),
          ) as CustomerBookingEligibilityReasonCodeEnum?;
          if (valueDes == null) continue;
          result.reasonCode = valueDes;
          break;
        case r'requiredAction':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerBookingEligibilityRequiredActionEnum),
          ) as CustomerBookingEligibilityRequiredActionEnum?;
          if (valueDes == null) continue;
          result.requiredAction = valueDes;
          break;
        case r'cutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.cutoffAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerBookingEligibility deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingEligibilityBuilder();
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

class CustomerBookingEligibilityReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'IDENTITY_VERIFICATION_REQUIRED')
  static const CustomerBookingEligibilityReasonCodeEnum IDENTITY_VERIFICATION_REQUIRED = _$customerBookingEligibilityReasonCodeEnum_IDENTITY_VERIFICATION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'MATCHING_PACKAGE_REQUIRED')
  static const CustomerBookingEligibilityReasonCodeEnum MATCHING_PACKAGE_REQUIRED = _$customerBookingEligibilityReasonCodeEnum_MATCHING_PACKAGE_REQUIRED;
  @BuiltValueEnumConst(wireName: r'INSUFFICIENT_AVAILABLE_SESSION')
  static const CustomerBookingEligibilityReasonCodeEnum INSUFFICIENT_AVAILABLE_SESSION = _$customerBookingEligibilityReasonCodeEnum_INSUFFICIENT_AVAILABLE_SESSION;
  @BuiltValueEnumConst(wireName: r'SLOT_FULL')
  static const CustomerBookingEligibilityReasonCodeEnum SLOT_FULL = _$customerBookingEligibilityReasonCodeEnum_SLOT_FULL;
  @BuiltValueEnumConst(wireName: r'SLOT_UNAVAILABLE')
  static const CustomerBookingEligibilityReasonCodeEnum SLOT_UNAVAILABLE = _$customerBookingEligibilityReasonCodeEnum_SLOT_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'BOOKING_CUTOFF_PASSED')
  static const CustomerBookingEligibilityReasonCodeEnum BOOKING_CUTOFF_PASSED = _$customerBookingEligibilityReasonCodeEnum_BOOKING_CUTOFF_PASSED;

  static Serializer<CustomerBookingEligibilityReasonCodeEnum> get serializer => _$customerBookingEligibilityReasonCodeEnumSerializer;

  const CustomerBookingEligibilityReasonCodeEnum._(String name): super(name);

  static BuiltSet<CustomerBookingEligibilityReasonCodeEnum> get values => _$customerBookingEligibilityReasonCodeEnumValues;
  static CustomerBookingEligibilityReasonCodeEnum valueOf(String name) => _$customerBookingEligibilityReasonCodeEnumValueOf(name);
}

class CustomerBookingEligibilityRequiredActionEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'COMPLETE_IDENTITY_VERIFICATION')
  static const CustomerBookingEligibilityRequiredActionEnum COMPLETE_IDENTITY_VERIFICATION = _$customerBookingEligibilityRequiredActionEnum_COMPLETE_IDENTITY_VERIFICATION;
  @BuiltValueEnumConst(wireName: r'BUY_MATCHING_PACKAGE')
  static const CustomerBookingEligibilityRequiredActionEnum BUY_MATCHING_PACKAGE = _$customerBookingEligibilityRequiredActionEnum_BUY_MATCHING_PACKAGE;
  @BuiltValueEnumConst(wireName: r'CONTACT_STUDIO')
  static const CustomerBookingEligibilityRequiredActionEnum CONTACT_STUDIO = _$customerBookingEligibilityRequiredActionEnum_CONTACT_STUDIO;

  static Serializer<CustomerBookingEligibilityRequiredActionEnum> get serializer => _$customerBookingEligibilityRequiredActionEnumSerializer;

  const CustomerBookingEligibilityRequiredActionEnum._(String name): super(name);

  static BuiltSet<CustomerBookingEligibilityRequiredActionEnum> get values => _$customerBookingEligibilityRequiredActionEnumValues;
  static CustomerBookingEligibilityRequiredActionEnum valueOf(String name) => _$customerBookingEligibilityRequiredActionEnumValueOf(name);
}

