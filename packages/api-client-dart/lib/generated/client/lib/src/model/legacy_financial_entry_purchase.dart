//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'legacy_financial_entry_purchase.g.dart';

/// LegacyFinancialEntryPurchase
///
/// Properties:
/// * [id] 
@BuiltValue()
abstract class LegacyFinancialEntryPurchase implements Built<LegacyFinancialEntryPurchase, LegacyFinancialEntryPurchaseBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  LegacyFinancialEntryPurchase._();

  factory LegacyFinancialEntryPurchase([void updates(LegacyFinancialEntryPurchaseBuilder b)]) = _$LegacyFinancialEntryPurchase;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LegacyFinancialEntryPurchaseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LegacyFinancialEntryPurchase> get serializer => _$LegacyFinancialEntryPurchaseSerializer();
}

class _$LegacyFinancialEntryPurchaseSerializer implements PrimitiveSerializer<LegacyFinancialEntryPurchase> {
  @override
  final Iterable<Type> types = const [LegacyFinancialEntryPurchase, _$LegacyFinancialEntryPurchase];

  @override
  final String wireName = r'LegacyFinancialEntryPurchase';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LegacyFinancialEntryPurchase object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    LegacyFinancialEntryPurchase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LegacyFinancialEntryPurchaseBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LegacyFinancialEntryPurchase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LegacyFinancialEntryPurchaseBuilder();
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

