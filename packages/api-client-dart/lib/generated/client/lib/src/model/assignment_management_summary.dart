//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment_management_summary.g.dart';

/// AssignmentManagementSummary
///
/// Properties:
/// * [total] 
/// * [active] 
/// * [ended] 
@BuiltValue()
abstract class AssignmentManagementSummary implements Built<AssignmentManagementSummary, AssignmentManagementSummaryBuilder> {
  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'active')
  int get active;

  @BuiltValueField(wireName: r'ended')
  int get ended;

  AssignmentManagementSummary._();

  factory AssignmentManagementSummary([void updates(AssignmentManagementSummaryBuilder b)]) = _$AssignmentManagementSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentManagementSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignmentManagementSummary> get serializer => _$AssignmentManagementSummarySerializer();
}

class _$AssignmentManagementSummarySerializer implements PrimitiveSerializer<AssignmentManagementSummary> {
  @override
  final Iterable<Type> types = const [AssignmentManagementSummary, _$AssignmentManagementSummary];

  @override
  final String wireName = r'AssignmentManagementSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignmentManagementSummary object, {
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
    yield r'ended';
    yield serializers.serialize(
      object.ended,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignmentManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentManagementSummaryBuilder result,
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
        case r'ended':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ended = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignmentManagementSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentManagementSummaryBuilder();
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

