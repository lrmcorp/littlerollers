//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_branch_reconciliation.g.dart';

/// FinanceBranchReconciliation
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [expectedRp] 
/// * [receivedRp] 
/// * [approvedRp] 
/// * [pendingCount] 
/// * [anomalyCount] 
@BuiltValue()
abstract class FinanceBranchReconciliation implements Built<FinanceBranchReconciliation, FinanceBranchReconciliationBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'expectedRp')
  int get expectedRp;

  @BuiltValueField(wireName: r'receivedRp')
  int get receivedRp;

  @BuiltValueField(wireName: r'approvedRp')
  int get approvedRp;

  @BuiltValueField(wireName: r'pendingCount')
  int get pendingCount;

  @BuiltValueField(wireName: r'anomalyCount')
  int get anomalyCount;

  FinanceBranchReconciliation._();

  factory FinanceBranchReconciliation([void updates(FinanceBranchReconciliationBuilder b)]) = _$FinanceBranchReconciliation;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceBranchReconciliationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceBranchReconciliation> get serializer => _$FinanceBranchReconciliationSerializer();
}

class _$FinanceBranchReconciliationSerializer implements PrimitiveSerializer<FinanceBranchReconciliation> {
  @override
  final Iterable<Type> types = const [FinanceBranchReconciliation, _$FinanceBranchReconciliation];

  @override
  final String wireName = r'FinanceBranchReconciliation';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceBranchReconciliation object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'expectedRp';
    yield serializers.serialize(
      object.expectedRp,
      specifiedType: const FullType(int),
    );
    yield r'receivedRp';
    yield serializers.serialize(
      object.receivedRp,
      specifiedType: const FullType(int),
    );
    yield r'approvedRp';
    yield serializers.serialize(
      object.approvedRp,
      specifiedType: const FullType(int),
    );
    yield r'pendingCount';
    yield serializers.serialize(
      object.pendingCount,
      specifiedType: const FullType(int),
    );
    yield r'anomalyCount';
    yield serializers.serialize(
      object.anomalyCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceBranchReconciliation object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceBranchReconciliationBuilder result,
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
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'expectedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedRp = valueDes;
          break;
        case r'receivedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.receivedRp = valueDes;
          break;
        case r'approvedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.approvedRp = valueDes;
          break;
        case r'pendingCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pendingCount = valueDes;
          break;
        case r'anomalyCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.anomalyCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceBranchReconciliation deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceBranchReconciliationBuilder();
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

