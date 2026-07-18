//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_package_balance.dart';
import 'package:openapi/src/model/ledger_entry.dart';
import 'package:openapi/src/model/purchase.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'approval_result.g.dart';

/// ApprovalResult
///
/// Properties:
/// * [purchase] 
/// * [customerPackage] 
/// * [ledgerEntry] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class ApprovalResult implements Built<ApprovalResult, ApprovalResultBuilder> {
  @BuiltValueField(wireName: r'purchase')
  Purchase get purchase;

  @BuiltValueField(wireName: r'customerPackage')
  CustomerPackageBalance get customerPackage;

  @BuiltValueField(wireName: r'ledgerEntry')
  LedgerEntry get ledgerEntry;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  ApprovalResult._();

  factory ApprovalResult([void updates(ApprovalResultBuilder b)]) = _$ApprovalResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ApprovalResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ApprovalResult> get serializer => _$ApprovalResultSerializer();
}

class _$ApprovalResultSerializer implements PrimitiveSerializer<ApprovalResult> {
  @override
  final Iterable<Type> types = const [ApprovalResult, _$ApprovalResult];

  @override
  final String wireName = r'ApprovalResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ApprovalResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'purchase';
    yield serializers.serialize(
      object.purchase,
      specifiedType: const FullType(Purchase),
    );
    yield r'customerPackage';
    yield serializers.serialize(
      object.customerPackage,
      specifiedType: const FullType(CustomerPackageBalance),
    );
    yield r'ledgerEntry';
    yield serializers.serialize(
      object.ledgerEntry,
      specifiedType: const FullType(LedgerEntry),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ApprovalResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ApprovalResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'purchase':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Purchase),
          ) as Purchase;
          result.purchase.replace(valueDes);
          break;
        case r'customerPackage':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerPackageBalance),
          ) as CustomerPackageBalance;
          result.customerPackage.replace(valueDes);
          break;
        case r'ledgerEntry':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(LedgerEntry),
          ) as LedgerEntry;
          result.ledgerEntry.replace(valueDes);
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ApprovalResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ApprovalResultBuilder();
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

