//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_package_balance.g.dart';

/// CustomerPackageBalance
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [customerUserId] 
/// * [packageId] 
/// * [status] 
/// * [activationDate] 
/// * [expiryAt] 
/// * [ledgerBalance] 
/// * [reserved] 
/// * [available] 
/// * [salePriceRp] 
/// * [sessionCountSnapshot] 
/// * [durationDaysSnapshot] 
/// * [projectionRateRp] 
@BuiltValue()
abstract class CustomerPackageBalance implements Built<CustomerPackageBalance, CustomerPackageBalanceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'customerUserId')
  String get customerUserId;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'status')
  CustomerPackageBalanceStatusEnum get status;
  // enum statusEnum {  ACTIVE,  EXPIRED,  INACTIVE,  };

  @BuiltValueField(wireName: r'activationDate')
  Date get activationDate;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  @BuiltValueField(wireName: r'ledgerBalance')
  int get ledgerBalance;

  @BuiltValueField(wireName: r'reserved')
  int get reserved;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'salePriceRp')
  int? get salePriceRp;

  @BuiltValueField(wireName: r'sessionCountSnapshot')
  int? get sessionCountSnapshot;

  @BuiltValueField(wireName: r'durationDaysSnapshot')
  int? get durationDaysSnapshot;

  @BuiltValueField(wireName: r'projectionRateRp')
  int? get projectionRateRp;

  CustomerPackageBalance._();

  factory CustomerPackageBalance([void updates(CustomerPackageBalanceBuilder b)]) = _$CustomerPackageBalance;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerPackageBalanceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerPackageBalance> get serializer => _$CustomerPackageBalanceSerializer();
}

class _$CustomerPackageBalanceSerializer implements PrimitiveSerializer<CustomerPackageBalance> {
  @override
  final Iterable<Type> types = const [CustomerPackageBalance, _$CustomerPackageBalance];

  @override
  final String wireName = r'CustomerPackageBalance';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerPackageBalance object, {
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
    yield r'customerUserId';
    yield serializers.serialize(
      object.customerUserId,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CustomerPackageBalanceStatusEnum),
    );
    yield r'activationDate';
    yield serializers.serialize(
      object.activationDate,
      specifiedType: const FullType(Date),
    );
    yield r'expiryAt';
    yield serializers.serialize(
      object.expiryAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'ledgerBalance';
    yield serializers.serialize(
      object.ledgerBalance,
      specifiedType: const FullType(int),
    );
    yield r'reserved';
    yield serializers.serialize(
      object.reserved,
      specifiedType: const FullType(int),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    if (object.salePriceRp != null) {
      yield r'salePriceRp';
      yield serializers.serialize(
        object.salePriceRp,
        specifiedType: const FullType(int),
      );
    }
    if (object.sessionCountSnapshot != null) {
      yield r'sessionCountSnapshot';
      yield serializers.serialize(
        object.sessionCountSnapshot,
        specifiedType: const FullType(int),
      );
    }
    if (object.durationDaysSnapshot != null) {
      yield r'durationDaysSnapshot';
      yield serializers.serialize(
        object.durationDaysSnapshot,
        specifiedType: const FullType(int),
      );
    }
    if (object.projectionRateRp != null) {
      yield r'projectionRateRp';
      yield serializers.serialize(
        object.projectionRateRp,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerPackageBalance object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerPackageBalanceBuilder result,
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
        case r'customerUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerUserId = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerPackageBalanceStatusEnum),
          ) as CustomerPackageBalanceStatusEnum;
          result.status = valueDes;
          break;
        case r'activationDate':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.activationDate = valueDes;
          break;
        case r'expiryAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiryAt = valueDes;
          break;
        case r'ledgerBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ledgerBalance = valueDes;
          break;
        case r'reserved':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.reserved = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'salePriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.salePriceRp = valueDes;
          break;
        case r'sessionCountSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCountSnapshot = valueDes;
          break;
        case r'durationDaysSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDaysSnapshot = valueDes;
          break;
        case r'projectionRateRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.projectionRateRp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerPackageBalance deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerPackageBalanceBuilder();
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

class CustomerPackageBalanceStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CustomerPackageBalanceStatusEnum ACTIVE = _$customerPackageBalanceStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const CustomerPackageBalanceStatusEnum EXPIRED = _$customerPackageBalanceStatusEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const CustomerPackageBalanceStatusEnum INACTIVE = _$customerPackageBalanceStatusEnum_INACTIVE;

  static Serializer<CustomerPackageBalanceStatusEnum> get serializer => _$customerPackageBalanceStatusEnumSerializer;

  const CustomerPackageBalanceStatusEnum._(String name): super(name);

  static BuiltSet<CustomerPackageBalanceStatusEnum> get values => _$customerPackageBalanceStatusEnumValues;
  static CustomerPackageBalanceStatusEnum valueOf(String name) => _$customerPackageBalanceStatusEnumValueOf(name);
}

