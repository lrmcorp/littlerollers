//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'legacy_financial_entry_page_summary_value.g.dart';

/// LegacyFinancialEntryPageSummaryValue
///
/// Properties:
/// * [amountRp] 
/// * [count] 
@BuiltValue()
abstract class LegacyFinancialEntryPageSummaryValue implements Built<LegacyFinancialEntryPageSummaryValue, LegacyFinancialEntryPageSummaryValueBuilder> {
  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  @BuiltValueField(wireName: r'count')
  int get count;

  LegacyFinancialEntryPageSummaryValue._();

  factory LegacyFinancialEntryPageSummaryValue([void updates(LegacyFinancialEntryPageSummaryValueBuilder b)]) = _$LegacyFinancialEntryPageSummaryValue;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LegacyFinancialEntryPageSummaryValueBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LegacyFinancialEntryPageSummaryValue> get serializer => _$LegacyFinancialEntryPageSummaryValueSerializer();
}

class _$LegacyFinancialEntryPageSummaryValueSerializer implements PrimitiveSerializer<LegacyFinancialEntryPageSummaryValue> {
  @override
  final Iterable<Type> types = const [LegacyFinancialEntryPageSummaryValue, _$LegacyFinancialEntryPageSummaryValue];

  @override
  final String wireName = r'LegacyFinancialEntryPageSummaryValue';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LegacyFinancialEntryPageSummaryValue object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
    yield r'count';
    yield serializers.serialize(
      object.count,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    LegacyFinancialEntryPageSummaryValue object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LegacyFinancialEntryPageSummaryValueBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.count = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LegacyFinancialEntryPageSummaryValue deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LegacyFinancialEntryPageSummaryValueBuilder();
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

