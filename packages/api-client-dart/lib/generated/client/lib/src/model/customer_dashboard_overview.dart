//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_dashboard_overview_packages_inner.dart';
import 'package:openapi/src/model/customer_dashboard_overview_verification.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_dashboard_overview_upcoming_bookings_inner.dart';
import 'package:openapi/src/model/customer_dashboard_overview_actionable_orders_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview.g.dart';

/// CustomerDashboardOverview
///
/// Properties:
/// * [generatedAt] 
/// * [upcomingBookings] 
/// * [packages] 
/// * [actionableOrders] 
/// * [verification] 
/// * [unreadNotifications] 
@BuiltValue()
abstract class CustomerDashboardOverview implements Built<CustomerDashboardOverview, CustomerDashboardOverviewBuilder> {
  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'upcomingBookings')
  BuiltList<CustomerDashboardOverviewUpcomingBookingsInner> get upcomingBookings;

  @BuiltValueField(wireName: r'packages')
  BuiltList<CustomerDashboardOverviewPackagesInner> get packages;

  @BuiltValueField(wireName: r'actionableOrders')
  BuiltList<CustomerDashboardOverviewActionableOrdersInner> get actionableOrders;

  @BuiltValueField(wireName: r'verification')
  CustomerDashboardOverviewVerification get verification;

  @BuiltValueField(wireName: r'unreadNotifications')
  int get unreadNotifications;

  CustomerDashboardOverview._();

  factory CustomerDashboardOverview([void updates(CustomerDashboardOverviewBuilder b)]) = _$CustomerDashboardOverview;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverview> get serializer => _$CustomerDashboardOverviewSerializer();
}

class _$CustomerDashboardOverviewSerializer implements PrimitiveSerializer<CustomerDashboardOverview> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverview, _$CustomerDashboardOverview];

  @override
  final String wireName = r'CustomerDashboardOverview';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'upcomingBookings';
    yield serializers.serialize(
      object.upcomingBookings,
      specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewUpcomingBookingsInner)]),
    );
    yield r'packages';
    yield serializers.serialize(
      object.packages,
      specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewPackagesInner)]),
    );
    yield r'actionableOrders';
    yield serializers.serialize(
      object.actionableOrders,
      specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewActionableOrdersInner)]),
    );
    yield r'verification';
    yield serializers.serialize(
      object.verification,
      specifiedType: const FullType(CustomerDashboardOverviewVerification),
    );
    yield r'unreadNotifications';
    yield serializers.serialize(
      object.unreadNotifications,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        case r'upcomingBookings':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewUpcomingBookingsInner)]),
          ) as BuiltList<CustomerDashboardOverviewUpcomingBookingsInner>;
          result.upcomingBookings.replace(valueDes);
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewPackagesInner)]),
          ) as BuiltList<CustomerDashboardOverviewPackagesInner>;
          result.packages.replace(valueDes);
          break;
        case r'actionableOrders':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewActionableOrdersInner)]),
          ) as BuiltList<CustomerDashboardOverviewActionableOrdersInner>;
          result.actionableOrders.replace(valueDes);
          break;
        case r'verification':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerDashboardOverviewVerification),
          ) as CustomerDashboardOverviewVerification;
          result.verification.replace(valueDes);
          break;
        case r'unreadNotifications':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.unreadNotifications = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverview deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewBuilder();
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

