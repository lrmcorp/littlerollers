//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_dependency_summary.g.dart';

/// BranchDependencySummary
///
/// Properties:
/// * [assignments] 
/// * [futureClasses] 
/// * [packages] 
/// * [paymentAccounts] 
/// * [classTypes] 
/// * [staff] 
@BuiltValue()
abstract class BranchDependencySummary implements Built<BranchDependencySummary, BranchDependencySummaryBuilder> {
  @BuiltValueField(wireName: r'assignments')
  int get assignments;

  @BuiltValueField(wireName: r'futureClasses')
  int get futureClasses;

  @BuiltValueField(wireName: r'packages')
  int get packages;

  @BuiltValueField(wireName: r'paymentAccounts')
  int get paymentAccounts;

  @BuiltValueField(wireName: r'classTypes')
  int get classTypes;

  @BuiltValueField(wireName: r'staff')
  int get staff;

  BranchDependencySummary._();

  factory BranchDependencySummary([void updates(BranchDependencySummaryBuilder b)]) = _$BranchDependencySummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchDependencySummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchDependencySummary> get serializer => _$BranchDependencySummarySerializer();
}

class _$BranchDependencySummarySerializer implements PrimitiveSerializer<BranchDependencySummary> {
  @override
  final Iterable<Type> types = const [BranchDependencySummary, _$BranchDependencySummary];

  @override
  final String wireName = r'BranchDependencySummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchDependencySummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'assignments';
    yield serializers.serialize(
      object.assignments,
      specifiedType: const FullType(int),
    );
    yield r'futureClasses';
    yield serializers.serialize(
      object.futureClasses,
      specifiedType: const FullType(int),
    );
    yield r'packages';
    yield serializers.serialize(
      object.packages,
      specifiedType: const FullType(int),
    );
    yield r'paymentAccounts';
    yield serializers.serialize(
      object.paymentAccounts,
      specifiedType: const FullType(int),
    );
    yield r'classTypes';
    yield serializers.serialize(
      object.classTypes,
      specifiedType: const FullType(int),
    );
    yield r'staff';
    yield serializers.serialize(
      object.staff,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BranchDependencySummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchDependencySummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'assignments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.assignments = valueDes;
          break;
        case r'futureClasses':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.futureClasses = valueDes;
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.packages = valueDes;
          break;
        case r'paymentAccounts':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.paymentAccounts = valueDes;
          break;
        case r'classTypes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.classTypes = valueDes;
          break;
        case r'staff':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.staff = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BranchDependencySummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchDependencySummaryBuilder();
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

