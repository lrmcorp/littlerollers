//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'instructor_compensation_row.g.dart';

/// InstructorCompensationRow
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [instructorUserId] 
/// * [matchedClassCount] 
/// * [feeRpSnapshot] 
/// * [amountRp] 
@BuiltValue()
abstract class InstructorCompensationRow implements Built<InstructorCompensationRow, InstructorCompensationRowBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'instructorUserId')
  String get instructorUserId;

  @BuiltValueField(wireName: r'matchedClassCount')
  int get matchedClassCount;

  @BuiltValueField(wireName: r'feeRpSnapshot')
  int get feeRpSnapshot;

  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  InstructorCompensationRow._();

  factory InstructorCompensationRow([void updates(InstructorCompensationRowBuilder b)]) = _$InstructorCompensationRow;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(InstructorCompensationRowBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<InstructorCompensationRow> get serializer => _$InstructorCompensationRowSerializer();
}

class _$InstructorCompensationRowSerializer implements PrimitiveSerializer<InstructorCompensationRow> {
  @override
  final Iterable<Type> types = const [InstructorCompensationRow, _$InstructorCompensationRow];

  @override
  final String wireName = r'InstructorCompensationRow';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    InstructorCompensationRow object, {
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
    yield r'instructorUserId';
    yield serializers.serialize(
      object.instructorUserId,
      specifiedType: const FullType(String),
    );
    yield r'matchedClassCount';
    yield serializers.serialize(
      object.matchedClassCount,
      specifiedType: const FullType(int),
    );
    yield r'feeRpSnapshot';
    yield serializers.serialize(
      object.feeRpSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    InstructorCompensationRow object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required InstructorCompensationRowBuilder result,
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
        case r'instructorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.instructorUserId = valueDes;
          break;
        case r'matchedClassCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.matchedClassCount = valueDes;
          break;
        case r'feeRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.feeRpSnapshot = valueDes;
          break;
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  InstructorCompensationRow deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = InstructorCompensationRowBuilder();
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

