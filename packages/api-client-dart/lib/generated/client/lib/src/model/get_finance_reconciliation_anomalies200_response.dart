//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/finance_anomaly.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'get_finance_reconciliation_anomalies200_response.g.dart';

/// GetFinanceReconciliationAnomalies200Response
///
/// Properties:
/// * [generatedAt] 
/// * [items] 
/// * [total] 
@BuiltValue()
abstract class GetFinanceReconciliationAnomalies200Response implements Built<GetFinanceReconciliationAnomalies200Response, GetFinanceReconciliationAnomalies200ResponseBuilder> {
  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'items')
  BuiltList<FinanceAnomaly> get items;

  @BuiltValueField(wireName: r'total')
  int get total;

  GetFinanceReconciliationAnomalies200Response._();

  factory GetFinanceReconciliationAnomalies200Response([void updates(GetFinanceReconciliationAnomalies200ResponseBuilder b)]) = _$GetFinanceReconciliationAnomalies200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(GetFinanceReconciliationAnomalies200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<GetFinanceReconciliationAnomalies200Response> get serializer => _$GetFinanceReconciliationAnomalies200ResponseSerializer();
}

class _$GetFinanceReconciliationAnomalies200ResponseSerializer implements PrimitiveSerializer<GetFinanceReconciliationAnomalies200Response> {
  @override
  final Iterable<Type> types = const [GetFinanceReconciliationAnomalies200Response, _$GetFinanceReconciliationAnomalies200Response];

  @override
  final String wireName = r'GetFinanceReconciliationAnomalies200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    GetFinanceReconciliationAnomalies200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(FinanceAnomaly)]),
    );
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    GetFinanceReconciliationAnomalies200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required GetFinanceReconciliationAnomalies200ResponseBuilder result,
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
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FinanceAnomaly)]),
          ) as BuiltList<FinanceAnomaly>;
          result.items.replace(valueDes);
          break;
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  GetFinanceReconciliationAnomalies200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = GetFinanceReconciliationAnomalies200ResponseBuilder();
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

