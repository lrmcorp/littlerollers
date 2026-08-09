//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_package_balance_summary.g.dart';

/// Authoritative totals over the complete authorized filtered result, independent from cursor pagination.
///
/// Properties:
/// * [packageCount] 
/// * [activePackageCount] 
/// * [ledgerBalance] 
/// * [reserved] 
/// * [available] 
/// * [usedSessions] 
/// * [reversedSessions] 
/// * [adjustmentDelta] 
/// * [expiringSoon] 
@BuiltValue()
abstract class CustomerPackageBalanceSummary implements Built<CustomerPackageBalanceSummary, CustomerPackageBalanceSummaryBuilder> {
  @BuiltValueField(wireName: r'packageCount')
  int get packageCount;

  @BuiltValueField(wireName: r'activePackageCount')
  int get activePackageCount;

  @BuiltValueField(wireName: r'ledgerBalance')
  int get ledgerBalance;

  @BuiltValueField(wireName: r'reserved')
  int get reserved;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'usedSessions')
  int get usedSessions;

  @BuiltValueField(wireName: r'reversedSessions')
  int get reversedSessions;

  @BuiltValueField(wireName: r'adjustmentDelta')
  int get adjustmentDelta;

  @BuiltValueField(wireName: r'expiringSoon')
  int get expiringSoon;

  CustomerPackageBalanceSummary._();

  factory CustomerPackageBalanceSummary([void updates(CustomerPackageBalanceSummaryBuilder b)]) = _$CustomerPackageBalanceSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerPackageBalanceSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerPackageBalanceSummary> get serializer => _$CustomerPackageBalanceSummarySerializer();
}

class _$CustomerPackageBalanceSummarySerializer implements PrimitiveSerializer<CustomerPackageBalanceSummary> {
  @override
  final Iterable<Type> types = const [CustomerPackageBalanceSummary, _$CustomerPackageBalanceSummary];

  @override
  final String wireName = r'CustomerPackageBalanceSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerPackageBalanceSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'packageCount';
    yield serializers.serialize(
      object.packageCount,
      specifiedType: const FullType(int),
    );
    yield r'activePackageCount';
    yield serializers.serialize(
      object.activePackageCount,
      specifiedType: const FullType(int),
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
    yield r'usedSessions';
    yield serializers.serialize(
      object.usedSessions,
      specifiedType: const FullType(int),
    );
    yield r'reversedSessions';
    yield serializers.serialize(
      object.reversedSessions,
      specifiedType: const FullType(int),
    );
    yield r'adjustmentDelta';
    yield serializers.serialize(
      object.adjustmentDelta,
      specifiedType: const FullType(int),
    );
    yield r'expiringSoon';
    yield serializers.serialize(
      object.expiringSoon,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerPackageBalanceSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerPackageBalanceSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'packageCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.packageCount = valueDes;
          break;
        case r'activePackageCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.activePackageCount = valueDes;
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
        case r'usedSessions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.usedSessions = valueDes;
          break;
        case r'reversedSessions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.reversedSessions = valueDes;
          break;
        case r'adjustmentDelta':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.adjustmentDelta = valueDes;
          break;
        case r'expiringSoon':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expiringSoon = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerPackageBalanceSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerPackageBalanceSummaryBuilder();
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

