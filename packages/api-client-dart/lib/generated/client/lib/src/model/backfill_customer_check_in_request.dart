//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'backfill_customer_check_in_request.g.dart';

/// BackfillCustomerCheckInRequest
///
/// Properties:
/// * [bookingId] 
/// * [reason] 
/// * [expectedVersion] 
@BuiltValue()
abstract class BackfillCustomerCheckInRequest implements Built<BackfillCustomerCheckInRequest, BackfillCustomerCheckInRequestBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'expectedVersion')
  int? get expectedVersion;

  BackfillCustomerCheckInRequest._();

  factory BackfillCustomerCheckInRequest([void updates(BackfillCustomerCheckInRequestBuilder b)]) = _$BackfillCustomerCheckInRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BackfillCustomerCheckInRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BackfillCustomerCheckInRequest> get serializer => _$BackfillCustomerCheckInRequestSerializer();
}

class _$BackfillCustomerCheckInRequestSerializer implements PrimitiveSerializer<BackfillCustomerCheckInRequest> {
  @override
  final Iterable<Type> types = const [BackfillCustomerCheckInRequest, _$BackfillCustomerCheckInRequest];

  @override
  final String wireName = r'BackfillCustomerCheckInRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BackfillCustomerCheckInRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.expectedVersion != null) {
      yield r'expectedVersion';
      yield serializers.serialize(
        object.expectedVersion,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BackfillCustomerCheckInRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BackfillCustomerCheckInRequestBuilder result,
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BackfillCustomerCheckInRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BackfillCustomerCheckInRequestBuilder();
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

