//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_projection_row.g.dart';

/// FinancialProjectionRow
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [decidedAt] 
/// * [projectionRp] 
@BuiltValue()
abstract class FinancialProjectionRow implements Built<FinancialProjectionRow, FinancialProjectionRowBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime get decidedAt;

  @BuiltValueField(wireName: r'projectionRp')
  int get projectionRp;

  FinancialProjectionRow._();

  factory FinancialProjectionRow([void updates(FinancialProjectionRowBuilder b)]) = _$FinancialProjectionRow;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialProjectionRowBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialProjectionRow> get serializer => _$FinancialProjectionRowSerializer();
}

class _$FinancialProjectionRowSerializer implements PrimitiveSerializer<FinancialProjectionRow> {
  @override
  final Iterable<Type> types = const [FinancialProjectionRow, _$FinancialProjectionRow];

  @override
  final String wireName = r'FinancialProjectionRow';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialProjectionRow object, {
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
    yield r'decidedAt';
    yield serializers.serialize(
      object.decidedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'projectionRp';
    yield serializers.serialize(
      object.projectionRp,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialProjectionRow object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialProjectionRowBuilder result,
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
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.decidedAt = valueDes;
          break;
        case r'projectionRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.projectionRp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinancialProjectionRow deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialProjectionRowBuilder();
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

