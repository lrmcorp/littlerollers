//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_management_summary.g.dart';

/// BranchManagementSummary
///
/// Properties:
/// * [total] 
/// * [active] 
/// * [inactive] 
@BuiltValue()
abstract class BranchManagementSummary implements Built<BranchManagementSummary, BranchManagementSummaryBuilder> {
  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'active')
  int get active;

  @BuiltValueField(wireName: r'inactive')
  int get inactive;

  BranchManagementSummary._();

  factory BranchManagementSummary([void updates(BranchManagementSummaryBuilder b)]) = _$BranchManagementSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchManagementSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchManagementSummary> get serializer => _$BranchManagementSummarySerializer();
}

class _$BranchManagementSummarySerializer implements PrimitiveSerializer<BranchManagementSummary> {
  @override
  final Iterable<Type> types = const [BranchManagementSummary, _$BranchManagementSummary];

  @override
  final String wireName = r'BranchManagementSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(int),
    );
    yield r'inactive';
    yield serializers.serialize(
      object.inactive,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BranchManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchManagementSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.active = valueDes;
          break;
        case r'inactive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.inactive = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BranchManagementSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchManagementSummaryBuilder();
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

