//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_package_balance.g.dart';

/// US-PKG-02 approval snapshot; ledger browsing and derived balances remain US-LED-01.
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [customerUserId] 
/// * [packageId] 
/// * [classTypeId] 
/// * [activationDate] 
/// * [expiryAt] 
/// * [salePriceRp] 
/// * [sessionCountSnapshot] 
/// * [durationDaysSnapshot] 
/// * [projectionRateRp] 
/// * [version] 
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

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'activationDate')
  Date get activationDate;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  @BuiltValueField(wireName: r'salePriceRp')
  int get salePriceRp;

  @BuiltValueField(wireName: r'sessionCountSnapshot')
  int get sessionCountSnapshot;

  @BuiltValueField(wireName: r'durationDaysSnapshot')
  int get durationDaysSnapshot;

  @BuiltValueField(wireName: r'projectionRateRp')
  int get projectionRateRp;

  @BuiltValueField(wireName: r'version')
  int? get version;

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
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
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
    yield r'salePriceRp';
    yield serializers.serialize(
      object.salePriceRp,
      specifiedType: const FullType(int),
    );
    yield r'sessionCountSnapshot';
    yield serializers.serialize(
      object.sessionCountSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'durationDaysSnapshot';
    yield serializers.serialize(
      object.durationDaysSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'projectionRateRp';
    yield serializers.serialize(
      object.projectionRateRp,
      specifiedType: const FullType(int),
    );
    if (object.version != null) {
      yield r'version';
      yield serializers.serialize(
        object.version,
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
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
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

