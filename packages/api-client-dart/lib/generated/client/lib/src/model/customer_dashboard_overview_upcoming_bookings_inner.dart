//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview_upcoming_bookings_inner.g.dart';

/// CustomerDashboardOverviewUpcomingBookingsInner
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [className] 
/// * [branchName] 
/// * [timezone] 
/// * [startAt] 
/// * [endAt] 
@BuiltValue()
abstract class CustomerDashboardOverviewUpcomingBookingsInner implements Built<CustomerDashboardOverviewUpcomingBookingsInner, CustomerDashboardOverviewUpcomingBookingsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'className')
  String get className;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  CustomerDashboardOverviewUpcomingBookingsInner._();

  factory CustomerDashboardOverviewUpcomingBookingsInner([void updates(CustomerDashboardOverviewUpcomingBookingsInnerBuilder b)]) = _$CustomerDashboardOverviewUpcomingBookingsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewUpcomingBookingsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverviewUpcomingBookingsInner> get serializer => _$CustomerDashboardOverviewUpcomingBookingsInnerSerializer();
}

class _$CustomerDashboardOverviewUpcomingBookingsInnerSerializer implements PrimitiveSerializer<CustomerDashboardOverviewUpcomingBookingsInner> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverviewUpcomingBookingsInner, _$CustomerDashboardOverviewUpcomingBookingsInner];

  @override
  final String wireName = r'CustomerDashboardOverviewUpcomingBookingsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverviewUpcomingBookingsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'className';
    yield serializers.serialize(
      object.className,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
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
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewUpcomingBookingsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewUpcomingBookingsInnerBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'className':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.className = valueDes;
          break;
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverviewUpcomingBookingsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewUpcomingBookingsInnerBuilder();
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

