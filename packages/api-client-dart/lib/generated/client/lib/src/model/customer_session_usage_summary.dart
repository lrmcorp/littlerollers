//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_session_usage_summary.g.dart';

/// CustomerSessionUsageSummary
///
/// Properties:
/// * [initialSessions] 
/// * [usedSessions] 
/// * [reversedSessions] 
/// * [adjustmentDelta] 
@BuiltValue()
abstract class CustomerSessionUsageSummary implements Built<CustomerSessionUsageSummary, CustomerSessionUsageSummaryBuilder> {
  @BuiltValueField(wireName: r'initialSessions')
  int get initialSessions;

  @BuiltValueField(wireName: r'usedSessions')
  int get usedSessions;

  @BuiltValueField(wireName: r'reversedSessions')
  int get reversedSessions;

  @BuiltValueField(wireName: r'adjustmentDelta')
  int get adjustmentDelta;

  CustomerSessionUsageSummary._();

  factory CustomerSessionUsageSummary([void updates(CustomerSessionUsageSummaryBuilder b)]) = _$CustomerSessionUsageSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerSessionUsageSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerSessionUsageSummary> get serializer => _$CustomerSessionUsageSummarySerializer();
}

class _$CustomerSessionUsageSummarySerializer implements PrimitiveSerializer<CustomerSessionUsageSummary> {
  @override
  final Iterable<Type> types = const [CustomerSessionUsageSummary, _$CustomerSessionUsageSummary];

  @override
  final String wireName = r'CustomerSessionUsageSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerSessionUsageSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'initialSessions';
    yield serializers.serialize(
      object.initialSessions,
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
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerSessionUsageSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerSessionUsageSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'initialSessions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.initialSessions = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerSessionUsageSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerSessionUsageSummaryBuilder();
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

