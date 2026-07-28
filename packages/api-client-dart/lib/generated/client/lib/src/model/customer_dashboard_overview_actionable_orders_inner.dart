//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview_actionable_orders_inner.g.dart';

/// CustomerDashboardOverviewActionableOrdersInner
///
/// Properties:
/// * [id] 
/// * [packageName] 
/// * [branchName] 
/// * [status] 
/// * [payableAmountRp] 
/// * [expiresAt] 
@BuiltValue()
abstract class CustomerDashboardOverviewActionableOrdersInner implements Built<CustomerDashboardOverviewActionableOrdersInner, CustomerDashboardOverviewActionableOrdersInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'packageName')
  String get packageName;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

  @BuiltValueField(wireName: r'status')
  CustomerDashboardOverviewActionableOrdersInnerStatusEnum get status;
  // enum statusEnum {  AWAITING_PAYMENT,  PENDING,  ACTION_REQUIRED,  };

  @BuiltValueField(wireName: r'payableAmountRp')
  int get payableAmountRp;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime? get expiresAt;

  CustomerDashboardOverviewActionableOrdersInner._();

  factory CustomerDashboardOverviewActionableOrdersInner([void updates(CustomerDashboardOverviewActionableOrdersInnerBuilder b)]) = _$CustomerDashboardOverviewActionableOrdersInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewActionableOrdersInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverviewActionableOrdersInner> get serializer => _$CustomerDashboardOverviewActionableOrdersInnerSerializer();
}

class _$CustomerDashboardOverviewActionableOrdersInnerSerializer implements PrimitiveSerializer<CustomerDashboardOverviewActionableOrdersInner> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverviewActionableOrdersInner, _$CustomerDashboardOverviewActionableOrdersInner];

  @override
  final String wireName = r'CustomerDashboardOverviewActionableOrdersInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverviewActionableOrdersInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'packageName';
    yield serializers.serialize(
      object.packageName,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CustomerDashboardOverviewActionableOrdersInnerStatusEnum),
    );
    yield r'payableAmountRp';
    yield serializers.serialize(
      object.payableAmountRp,
      specifiedType: const FullType(int),
    );
    if (object.expiresAt != null) {
      yield r'expiresAt';
      yield serializers.serialize(
        object.expiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewActionableOrdersInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewActionableOrdersInnerBuilder result,
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
        case r'packageName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageName = valueDes;
          break;
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerDashboardOverviewActionableOrdersInnerStatusEnum),
          ) as CustomerDashboardOverviewActionableOrdersInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'payableAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.payableAmountRp = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.expiresAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverviewActionableOrdersInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewActionableOrdersInnerBuilder();
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

class CustomerDashboardOverviewActionableOrdersInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'AWAITING_PAYMENT')
  static const CustomerDashboardOverviewActionableOrdersInnerStatusEnum AWAITING_PAYMENT = _$customerDashboardOverviewActionableOrdersInnerStatusEnum_AWAITING_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PENDING')
  static const CustomerDashboardOverviewActionableOrdersInnerStatusEnum PENDING = _$customerDashboardOverviewActionableOrdersInnerStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const CustomerDashboardOverviewActionableOrdersInnerStatusEnum ACTION_REQUIRED = _$customerDashboardOverviewActionableOrdersInnerStatusEnum_ACTION_REQUIRED;

  static Serializer<CustomerDashboardOverviewActionableOrdersInnerStatusEnum> get serializer => _$customerDashboardOverviewActionableOrdersInnerStatusEnumSerializer;

  const CustomerDashboardOverviewActionableOrdersInnerStatusEnum._(String name): super(name);

  static BuiltSet<CustomerDashboardOverviewActionableOrdersInnerStatusEnum> get values => _$customerDashboardOverviewActionableOrdersInnerStatusEnumValues;
  static CustomerDashboardOverviewActionableOrdersInnerStatusEnum valueOf(String name) => _$customerDashboardOverviewActionableOrdersInnerStatusEnumValueOf(name);
}

